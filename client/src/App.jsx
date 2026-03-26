import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { requestForToken, onMessageListener } from './firebase';
import BottomNav from './components/Navigation/BottomNav';
import Login from './components/Login';
import Register from './components/Auth/Register';
import JoinArena from './components/Arena/JoinArena';
import Arena from './components/Arena';
import PersonalStats from './components/Dashboard/PersonalStats';
import LogForm from './components/LogForm';
import AvatarCustomizer from './components/Dashboard/AvatarCustomizer';
import ActivityHistory from './components/Dashboard/ActivityHistory';
import ThemeToggle from './components/Common/ThemeToggle';
import Welcome from './components/Welcome';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const socket = io(API_URL);
axios.defaults.baseURL = API_URL;

const getAchievements = (user) => {
  const achievements = [];
  if (user.currentStreak >= 7) achievements.push({ id: 'warrior-7', label: '7-Day Warrior', icon: '🔥' });
  if (user.totalPoints >= 1000) achievements.push({ id: 'points-1k', label: 'Point Pioneer', icon: '💎' });
  if (user.momentum === 'On Fire') achievements.push({ id: 'fire', label: 'On Fire', icon: '⚡' });
  return achievements;
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('arena');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
          setShowWelcome(false);
        } catch (err) {
          console.error('Session restoration failed:', err);
          handleLogout();
        }
      }
    };
    fetchUser();
  }, []);

  const setupNotifications = async () => {
    if (!user) return;
    const token = await requestForToken();
    if (token) {
      try {
        const authToken = localStorage.getItem('token');
        await axios.post('/api/auth/fcm-token', 
          { fcmToken: token }, 
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('FCM Token registered on backend');
        // Update local user state to reflect token presence
        setUser(prev => ({ ...prev, hasNotifications: true }));
      } catch (err) {
        console.error('Failed to register FCM token:', err);
      }
    }
  };

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        console.log('New foreground message:', payload);
      })
      .catch((err) => console.log('Messaging failed: ', err));
  }, []);

  useEffect(() => {
    if (roomCode) {
      socket.emit('join_room', roomCode);
      socket.on('update_dashboard', (data) => {
        setDashboardData(data);
      });
    }
    return () => {
      socket.off('update_dashboard');
    };
  }, [roomCode]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !roomCode) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [user, roomCode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRoomCode(null);
    setShowWelcome(true);
  };

  if (showWelcome) {
    return <Welcome onStart={() => setShowWelcome(false)} />;
  }

  if (!user) {
    return (
      <div className="app-shell centering-layout">
        <ThemeToggle />
        <div className="auth-wrapper">
          {isRegister ? (
            <Register 
              onLogin={setUser} 
              onSwitch={() => setIsRegister(false)} 
              onBack={() => setShowWelcome(true)}
            />
          ) : (
            <Login 
              onLogin={setUser} 
              onSwitch={() => setIsRegister(true)} 
              onBack={() => setShowWelcome(true)}
            />
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .centering-layout { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; }
          .auth-wrapper { width: 100%; max-width: 440px; display: flex; justify-content: center; align-items: center; }
        `}} />
      </div>
    );
  }

  if (!roomCode && !user.roomCode) {
    return (
      <div className="app-shell centering-layout">
        <ThemeToggle />
        <div className="auth-wrapper">
          <JoinArena 
            user={user} 
            onJoined={(code) => {
              setRoomCode(code);
              setUser(prev => ({ ...prev, roomCode: code }));
            }} 
          />
        </div>
      </div>
    );
  }

  if (!roomCode && user.roomCode) setRoomCode(user.roomCode);

  const userData = dashboardData.find(u => u._id === user._id) || user;

  const renderContent = () => {
    switch (activeTab) {
      case 'arena':
        return <Arena user={user} data={dashboardData} />;
      case 'my-stats':
        return <PersonalStats user={userData} />;
      case 'log':
        return <LogForm user={user} onComplete={() => setActiveTab('my-stats')} setupNotifications={setupNotifications} />;
      case 'profile':
        return (
          <div className="clay-card p-3">
            <div style={{ textAlign: 'center' }}>
              <div className="avatar-large-wrapper floating">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarSeed || user._id}`} 
                  alt="Avatar" 
                  className="dicebear-avatar-img"
                />
              </div>
              <h2 className="cartoon-title">{user.name}</h2>
              <p className="text-dim">Room Code: {roomCode}</p>
              
              <div className="profile-actions-clay mt-2">
                {!user.hasNotifications && (
                  <button className="clay-btn primary-btn" onClick={setupNotifications} style={{ background: 'var(--success)' }}>
                    🔔 Enable Notifications
                  </button>
                )}
                <button className="clay-btn primary-btn" onClick={() => setShowCustomizer(true)}>
                  🌟 Customize Identity
                </button>
                <button className="clay-btn secondary-btn" onClick={() => setShowHistory(true)}>
                  📜 View History
                </button>
                <button className="clay-btn logout-btn" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Arena user={user} data={dashboardData} />;
    }
  };

  return (
    <div className="app-shell">
      <ThemeToggle />
      <main className="content-area">
        <header className="dashboard-header">
          <div className="date-pill">
            <span className="day-text">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="date-text">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="achievement-strip">
            {getAchievements(userData).map(a => (
              <motion.div 
                key={a.id} 
                className="mini-achievement shadow-in"
                whileHover={{ scale: 1.1 }}
                title={a.label}
              >
                {a.icon}
              </motion.div>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCustomizer && (
          <AvatarCustomizer 
            user={user} 
            onUpdate={(updatedUser) => setUser(updatedUser)} 
            onClose={() => setShowCustomizer(false)} 
          />
        )}
        {showHistory && (
          <ActivityHistory onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .content-area { padding-bottom: 8rem; min-height: 100vh; overflow-y: auto; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; margin-bottom: 1rem; }
        .date-pill { background: var(--clay-card); padding: 0.6rem 1.2rem; border-radius: 1.5rem; box-shadow: var(--clay-shadow-out); display: flex; gap: 0.5rem; font-weight: 800; font-size: 0.85rem; }
        .day-text { color: var(--primary); }
        .date-text { color: var(--clay-text-dim); }
        
        .avatar-large-wrapper { width: 12rem; height: 12rem; background: var(--clay-bg); border-radius: 3rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; padding: 1rem; box-shadow: var(--clay-shadow-out); }
        .dicebear-avatar-img { width: 100%; height: 100%; object-fit: contain; }

        .achievement-strip { display: flex; gap: 0.6rem; }
        .mini-achievement { width: 2.5rem; height: 2.5rem; background: var(--clay-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: var(--clay-shadow-in); }

        .avatar-large { font-size: 5rem; margin: 1rem 0; }
        .p-3 { padding: 3rem; }
        .mt-2 { margin-top: 2rem; }
        .profile-actions-clay { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 300px; margin: 2rem auto 0; }
        .secondary-btn { background: var(--secondary); color: white; }
        .logout-btn { background: var(--accent); color: white; }
      `}} />
    </div>
  );
}

export default App;
