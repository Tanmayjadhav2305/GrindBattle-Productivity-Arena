const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const DailyLog = require('./models/DailyLog');
const { calculatePoints } = require('./services/scoringEngine');
const { calculateMomentum } = require('./services/momentumEngine');
const admin = require('firebase-admin');

// Firebase Admin initialization
try {
  if (!admin.apps.length) {
    let serviceAccount;

    // 1. Explicit Base64 (User's preferred method)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const rawJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(rawJson);
        console.log('🔥 FIREBASE: Using BASE64 environment variable');
      } catch (e) {
        console.error('FIREBASE: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64');
      }
    } 
    // 2. Individual Variables (Robust fallback)
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      };
      console.log('🔥 FIREBASE: Using individual environment variables');
    } 
    // 3. Raw JSON / Auto-detect Base64 (Standard fallback)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      
      // Auto-detect if it's Base64
      if (!rawConfig.startsWith('{') && !rawConfig.startsWith("'") && !rawConfig.startsWith('"')) {
        try {
          rawConfig = Buffer.from(rawConfig, 'base64').toString('utf8');
        } catch (e) {}
      }

      if (rawConfig.startsWith("'") || rawConfig.startsWith('"')) {
        rawConfig = rawConfig.substring(1, rawConfig.length - 1);
      }
      
      try {
        serviceAccount = JSON.parse(rawConfig.replace(/\\n/g, '\n'));
      } catch (parseError) {
        serviceAccount = JSON.parse(rawConfig.replace(/\n/g, '\\n'));
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('🔥 FIREBASE ADMIN INITIALIZED 🔥');
    } else {
      console.warn('⚠️ FIREBASE credentials not found. Notifications disabled.');
    }
  }
} catch (err) {
  console.error('❌ FIREBASE INITIALIZATION ERROR:', err.message);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"]
  } 
});
app.use(cors({ origin: "*" }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify JWT
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// ... routes ...

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatarSeed: Math.random().toString(36).substring(7)
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!req.user.fcmTokens.includes(fcmToken)) {
      req.user.fcmTokens.push(fcmToken);
      await req.user.save();
    }
    res.json({ message: 'FCM Token registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROOM ROUTES ---

app.post('/api/room/create', auth, async (req, res) => {
  try {
    const roomCode = (req.body.roomCode || Math.random().toString(36).substring(2, 8)).toUpperCase();
    req.user.roomCode = roomCode;
    await req.user.save();
    res.status(201).json({ message: 'Room created', roomCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/room/join', auth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    req.user.roomCode = roomCode.toUpperCase();
    await req.user.save();
    res.json({ message: 'Joined room', roomCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/update', auth, async (req, res) => {
  try {
    const { name, avatarSeed } = req.body;
    if (name) req.user.name = name;
    if (avatarSeed) req.user.avatarSeed = avatarSeed;
    await req.user.save();
    res.json({ message: 'Profile updated', user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATA ROUTES ---

app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const users = await User.find({ roomCode: req.user.roomCode });
    const today = new Date().toISOString().split('T')[0];
    const logsToday = await DailyLog.find({ date: today });

    const dashboardData = users.map(u => ({
      ...u.toObject(),
      todayStats: logsToday.find(l => l.userId.toString() === u._id.toString()) || { hours: 0, tasks: [], pointsEarned: 0 }
    }));

    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/log', auth, async (req, res) => {
  const { hours, tasks, category } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const user = req.user;

  try {
    const pointsEarned = calculatePoints(hours, user.currentStreak);
    let log = await DailyLog.findOne({ userId: user._id, date: today });
    const oldPoints = log ? log.pointsEarned : 0;

    if (log) {
      log.hours += parseFloat(hours);
      if (Array.isArray(tasks)) {
        log.tasks = [...new Set([...log.tasks, ...tasks])];
      }
      log.pointsEarned = calculatePoints(log.hours, user.currentStreak);
      await log.save();
    } else {
      const pointsInitial = calculatePoints(hours, user.currentStreak);
      log = new DailyLog({
        userId: user._id,
        date: today,
        hours: parseFloat(hours),
        tasks: Array.isArray(tasks) ? tasks : [],
        category,
        pointsEarned: pointsInitial
      });
      await log.save();

      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (user.lastActiveDate === yesterdayStr) user.currentStreak += 1;
      else if (user.lastActiveDate !== today) user.currentStreak = 1;
      user.lastActiveDate = today;
    }

    // Add the delta of points to total
    user.totalPoints += (log.pointsEarned - oldPoints);
    const last3Logs = await DailyLog.find({ userId: user._id }).sort({ date: -1 }).limit(3);
    user.momentum = calculateMomentum(last3Logs);
    await user.save();

    // Emit only to room
    const users = await User.find({ roomCode: user.roomCode });
    const today = new Date().toISOString().split('T')[0];
    const logsToday = await DailyLog.find({ date: today });
    const dashboardData = users.map(u => ({
      ...u.toObject(),
      todayStats: logsToday.find(l => l.userId.toString() === u._id.toString()) || { hours: 0, tasks: [], pointsEarned: 0 }
    }));

    io.to(user.roomCode).emit('update_dashboard', dashboardData);

    // --- ADVANCED NOTIFICATION LOGIC ---
    if (admin.apps.length > 0) {
      const opponents = await User.find({ 
        roomCode: user.roomCode, 
        _id: { $ne: user._id } 
      });

      for (const opponent of opponents) {
        if (!opponent.fcmTokens || opponent.fcmTokens.length === 0) continue;

        let title = '⚔️ Arena Update';
        let body = `${user.name} just logged ${hours}h of productivity!`;

        // Contextual Messages
        const userTotal = user.totalPoints;
        const opponentTotal = opponent.totalPoints;
        const diff = userTotal - opponentTotal;

        if (diff > 0 && (userTotal - pointsEarned) <= opponentTotal) {
          title = '😈 You just got overtaken!';
          body = `${user.name} passed you in the arena. Grind harder!`;
        } else if (diff < -50) {
          title = '⚠️ You’re falling behind';
          body = `${user.name} is ${Math.abs(diff).toFixed(0)} points ahead of you!`;
        } else if (pointsEarned > 20) {
          title = '🔥 Massive Progress!';
          body = `${user.name} just landed a huge session. Don't let them win!`;
        }

        const validTokens = [];
        for (const token of opponent.fcmTokens) {
          try {
            await admin.messaging().send({
              notification: { title, body },
              token: token
            });
            validTokens.push(token);
          } catch (error) {
            console.error(`Error sending to token ${token}:`, error.code);
            // If token is invalid (expired/unregistered), don't add to validTokens (effectively removing it)
            if (error.code !== 'messaging/registration-token-not-registered' && 
                error.code !== 'messaging/invalid-registration-token') {
              validTokens.push(token);
            }
          }
        }

        // Cleanup invalid tokens if any were removed
        if (validTokens.length !== opponent.fcmTokens.length) {
          opponent.fcmTokens = validTokens;
          await opponent.save();
        }
      }
    }

    res.json({ message: 'Logged successfully', log, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/:userId', auth, async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.params.userId }).sort({ date: -1 }).limit(7);
    res.json(logs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', auth, async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket logic
io.on('connection', (socket) => {
  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room ${roomCode}`);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Initial Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🛡️ WARRIOR DB CONNECTED (ATLAS) 🛡️'))
  .catch(err => {
    console.error('❌ DB CONNECTION FAILURE:', err.message);
    if (err.message.includes('buffering timed out')) {
      console.error('👉 TIP: Please allow access from anywhere (0.0.0.0/0) in your MongoDB Atlas IP Access List.');
    }
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🛡️ BATTLE STATION ACTIVE ON PORT ${PORT} 🛡️`));
