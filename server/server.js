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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify JWT
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

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
    const logsToday = await DailyLog.find({ date: today });
    const dashboardData = users.map(u => ({
      ...u.toObject(),
      todayStats: logsToday.find(l => l.userId.toString() === u._id.toString()) || { hours: 0, tasks: [], pointsEarned: 0 }
    }));
    
    io.to(user.roomCode).emit('update_dashboard', dashboardData);
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

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
