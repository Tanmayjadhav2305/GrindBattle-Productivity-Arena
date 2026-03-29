import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { requestForToken, onMessageListener } from './firebase';
import BottomNav from './components/Navigation/BottomNav';
import Sidebar from './components/Navigation/Sidebar';
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
import { Trophy, Home, PlusCircle, User, BarChart2, LogOut, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// 1. Production-Safe Configuration Validation
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Global Axios Defaults
if (VITE_API_URL) {
  axios.defaults.baseURL = VITE_API_URL;
  // Global response interceptor for session expiry
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('🔴 Session expired or unauthorized');
        // We handle actual logout in the component level to avoid loops
      }
      return Promise.reject(error);
    }
  );
}

const getAchievements = (user) => {
  if (!user) return [];
  const achievements = [];
  if (user.currentStreak >= 7) achievements.push({ id: 'warrior-7', label: '7-Day Warrior', icon: '🔥' });
  if (user.totalPoints >= 1000) achievements.push({ id: 'points-1k', label: 'Point Pioneer', icon: '💎' });
  if (user.momentum === 'On Fire') achievements.push({ id: 'fire', label: 'On Fire', icon: '⚡' });
  return achievements;
};

const NAV_TABS = [
  { id: 'arena', label: 'Arena', icon: Trophy },
  { id: 'my-stats', label: 'My Stats', icon: BarChart2 },
  { id: 'log', label: 'Log Progress', icon: PlusCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('arena');
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [configError, setConfigError] = useState(!VITE_API_URL);

  // 2. Production-Safe Socket Management
  const socketRef = useRef(null);

  useEffect(() => {
    if (!VITE_API_URL) return;

    try {
      socketRef.current = io(VITE_API_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('🔌 Socket Connection Error:', err.message);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } catch (err) {
      console.error('❌ Failed to initialize Socket:', err);
    }
  }, []);

  // 3. Safe LocalStorage Wrappers
  const safeGetItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error(`💾 LocalStorage read error (${key}):`, err);
      return null;
    }
  };

  const safeRemoveItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`💾 LocalStorage remove error (${key}):`, err);
    }
  };

  // 4. Session Restoration Effect
  useEffect(() => {
    const fetchUser = async () => {
      const token = safeGetItem('token');
      if (token && VITE_API_URL) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.user) {
            setUser(res.data.user);
            setShowWelcome(false);
          } else {
             throw new Error('Invalid user data received');
          }
        } catch (err) {
          console.error('🔑 Session restoration failed:', err.message);
          safeRemoveItem('token'); 
        }
      }
      setIsBooting(false);
    };
    fetchUser();
  }, []);

  // 5. Room Code Sync Effect
  useEffect(() => {
    if (user?.roomCode && !roomCode) {
      setRoomCode(user.roomCode);
    }
  }, [user?.roomCode, roomCode]);

  // 6. Notification Handlers
  const setupNotifications = useCallback(async () => {
    if (!user || !VITE_API_URL) return;
    setLoadingNotification(true);
    try {
      const token = await requestForToken();
      if (token) {
        const authToken = safeGetItem('token');
        await axios.post('/api/auth/fcm-token', 
          { fcmToken: token }, 
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        try { localStorage.setItem('fcmToken', token); } catch(e) {}
        setUser(prev => ({ 
          ...prev, 
          hasNotifications: true, 
          fcmTokens: [...new Set([...(prev?.fcmTokens || []), token])] 
        }));
      }
    } catch (err) {
      console.error('🔔 Notification Setup Error:', err);
    } finally {
      setLoadingNotification(false);
    }
  }, [user]);

  const disableNotifications = useCallback(async () => {
    if (!VITE_API_URL) return;
    try {
      const fcmToken = safeGetItem('fcmToken');
      const authToken = safeGetItem('token');
      await axios.post('/api/auth/fcm-token/disable', 
        { fcmToken }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      safeRemoveItem('fcmToken');
      setUser(prev => ({ ...prev, hasNotifications: false, fcmTokens: [] }));
    } catch (err) {
      console.error('🔕 Notification Disable Error:', err);
    }
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const payload = await onMessageListener();
        if (payload) console.log('📨 Foreground Message:', payload);
      } catch (err) {
        // Suppress expected "not supported" logs unless debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ Messaging listener inactive:', err.message);
        }
      }
    };
    initNotifications();
  }, []);

  // 7. Socket & Data Sync Effect
  useEffect(() => {
    const s = socketRef.current;
    if (roomCode && s) {
      s.emit('join_room', roomCode);
      const handleUpdate = (data) => {
        if (Array.isArray(data)) setDashboardData(data);
      };
      s.on('update_dashboard', handleUpdate);
      return () => {
        s.off('update_dashboard', handleUpdate);
      };
    }
  }, [roomCode]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?._id || !roomCode || !VITE_API_URL) return;
      try {
        const token = safeGetItem('token');
        const res = await axios.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) setDashboardData(res.data);
      } catch (err) {
        console.error('📊 Dashboard Sync Error:', err.message);
      }
    };
    fetchDashboard();
  }, [roomCode, user?._id]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.clear();
      setUser(null);
      setRoomCode(null);
      setShowWelcome(true);
      window.location.reload(); 
    } catch (err) {
      window.location.href = '/'; // Hard fallback
    }
  }, []);

  // Memoized derived data
  const userData = useMemo(() => {
    return dashboardData.find(u => u._id === user?._id) || user;
  }, [dashboardData, user]);

  const achievements = useMemo(() => getAchievements(userData), [userData]);

  // 8. Error & Fallback Rendering
  if (configError) {
    return (
      <div className="fatal-error-screen">
        <div className="clay-card error-card">
          <AlertTriangle size={60} color="var(--accent)" />
          <h1 className="cartoon-title">Configuration Error</h1>
          <p className="text-dim">The arena secret (API_URL) is missing. Please check your environment setup.</p>
          <button className="clay-btn clay-btn-primary mt-2" onClick={() => window.location.reload()}>
            <RefreshCw size={20} /> RETRY CONNECTION
          </button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .fatal-error-screen { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: var(--clay-bg); padding: 2rem; }
          .error-card { max-width: 440px; text-align: center; padding: 3rem; }
        `}} />
      </div>
    );
  }

  if (isBooting || showWelcome) {
    return <Welcome onStart={() => setShowWelcome(false)} />;
  }

  if (!user) {
    return (
      <div className="auth-fullscreen">
        <ThemeToggle />
        <div className="auth-content">
          {isRegister ? (
            <Register onLogin={setUser} onSwitch={() => setIsRegister(false)} onBack={() => setShowWelcome(true)} />
          ) : (
            <Login onLogin={setUser} onSwitch={() => setIsRegister(true)} onBack={() => setShowWelcome(true)} />
          )}
        </div>
      </div>
    );
  }

  if (!roomCode && !user.roomCode) {
    return (
      <div className="auth-fullscreen">
        <ThemeToggle />
        <div className="auth-content">
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
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarSeed || user._id}`} alt="Avatar" className="dicebear-avatar-img" />
              </div>
              <h2 className="cartoon-title">{user.name}</h2>
              <p className="text-dim">Room Code: {roomCode}</p>
              
              <div className="profile-actions-clay mt-2">
                <button 
                  className="clay-btn" 
                  onClick={user.hasNotifications ? disableNotifications : setupNotifications} 
                  style={{ background: user.hasNotifications ? 'var(--accent)' : 'var(--success)' }} 
                  disabled={loadingNotification}
                >
                  {loadingNotification ? '⏳' : (user.hasNotifications ? '🔕 Disable Notifications' : '🔔 Enable Notifications')}
                </button>
                <button className="clay-btn primary-btn" onClick={() => setShowCustomizer(true)}>🌟 Customize Identity</button>
                <button className="clay-btn secondary-btn" onClick={() => setShowHistory(true)}>📜 View History</button>
                <button className="clay-btn logout-btn" onClick={handleLogout}>🚪 Logout</button>
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
      {/* Desktop Sidebar - Hidden on mobile via CSS class */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        user={user} 
      />

      <main className="content-area">
        <header className="dashboard-header">
          <div className="date-pill">
            <span className="day-text">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="date-text">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="achievement-strip">
            {achievements.map(a => (
              <motion.div 
                key={a.id} 
                className="mini-achievement" 
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={activeTab === 'arena' ? 'grid-layout' : ''}
          >
            {renderContent()}
            {activeTab === 'arena' && (
              <div className="desktop-only-stats">
                <PersonalStats user={userData} compact />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistence/Popups */}
      <AnimatePresence>
        {showCustomizer && <AvatarCustomizer user={user} onUpdate={(u) => setUser(u)} onClose={() => setShowCustomizer(false)} />}
        {showHistory && <ActivityHistory onClose={() => setShowHistory(false)} />}
      </AnimatePresence>

      <ThemeToggle />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
