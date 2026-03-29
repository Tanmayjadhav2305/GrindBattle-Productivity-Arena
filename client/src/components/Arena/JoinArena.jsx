import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Zap, ArrowLeft, Trophy, ShieldQuestion, Sparkles } from 'lucide-react';

const JoinArena = ({ user, onJoined }) => {
  const [view, setView] = useState('choice'); // 'choice', 'host', 'join'
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/room/create', { roomCode: code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onJoined(res.data.roomCode);
    } catch (err) {
      setError('Failed to create room. Try again!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (code.length < 4) return setError('Enter a valid code!');
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/room/join', { roomCode: code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onJoined(code.toUpperCase());
    } catch (err) {
      setError('Room not found! Check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="arena-hub">
      <AnimatePresence mode="wait">
        {view === 'choice' ? (
          <motion.div 
            key="hub-choice"
            className="hub-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h1 className="hub-title">Pick Your Path</h1>
            <p className="hub-subtitle">How will you enter the arena today?</p>

            <div className="hub-grid">
              <motion.button 
                className="hub-card host-card" 
                whileHover={{ y: -10 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setView('host'); setCode(''); }}
              >
                <div className="hub-card-icon"><Trophy size={40} /></div>
                <h3>Host Battle</h3>
                <p>Create a battle room and define your own code.</p>
                <div className="hub-card-action">HOST ROOM ⚔️</div>
              </motion.button>

              <motion.button 
                className="hub-card join-card" 
                whileHover={{ y: -10 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setView('join'); setCode(''); }}
              >
                <div className="hub-card-icon"><Zap size={40} /></div>
                <h3>Join Rival</h3>
                <p>Have a code? Enter it to face your opponent.</p>
                <div className="hub-card-action">ENTER ARENA 🛡️</div>
              </motion.button>
            </div>
            
            {error && <div className="hub-error">{error}</div>}
          </motion.div>
        ) : view === 'host' ? (
          <motion.div 
            key="hub-host"
            className="hub-join-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <button className="hub-back-btn" onClick={() => setView('choice')}>
              <ArrowLeft size={18} /> BACK TO HUB
            </button>

            <div className="clay-card hub-join-card">
              <div className="hub-card-icon-mini"><Sparkles size={48} /></div>
              <h2>Create Battle Room</h2>
              <p className="text-dim">Enter a custom code or leave blank for a random one</p>

              <form onSubmit={handleCreate} className="mt-2">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="EX: WAR"
                  className="hub-code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                />
                {error && <div className="hub-error-mini">{error}</div>}
                <button className="clay-btn clay-btn-primary w-full mt-2" disabled={submitting}>
                  {submitting ? 'CREATING ARENA...' : 'START BATTLE 🚩'}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="hub-join"
            className="hub-join-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <button className="hub-back-btn" onClick={() => setView('choice')}>
              <ArrowLeft size={18} /> BACK TO HUB
            </button>

            <div className="clay-card hub-join-card">
              <div className="hub-card-icon-mini"><ShieldQuestion size={48} /></div>
              <h2>Enter Battle Code</h2>
              <p className="text-dim">Ask your friend for their 6-character code</p>

              <form onSubmit={handleJoin} className="mt-2">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="------"
                  className="hub-code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                />
                {error && <div className="hub-error-mini">{error}</div>}
                <button className="clay-btn clay-btn-primary w-full mt-2" disabled={submitting}>
                  {submitting ? 'CONNECTING...' : 'CONFIRM CHALLENGE'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinArena;
