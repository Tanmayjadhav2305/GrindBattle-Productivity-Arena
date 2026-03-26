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

      <style dangerouslySetInnerHTML={{ __html: `
        .arena-hub { width: 100%; display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 1.5rem; }
        .hub-container { width: 100%; max-width: 800px; text-align: center; }
        .hub-title { font-size: 2.8rem; font-weight: 900; margin-bottom: 0.5rem; color: var(--clay-text); }
        .hub-subtitle { color: var(--clay-text-dim); margin-bottom: 3rem; font-weight: 600; }
        
        .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 600px) { .hub-grid { grid-template-columns: 1fr; } }
        
        .hub-card { 
          background: var(--clay-card); 
          border: none; 
          border-radius: 2.5rem; 
          padding: 3rem 2rem; 
          box-shadow: var(--clay-shadow-out); 
          cursor: pointer; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          text-align: center;
          transition: all 0.3s ease;
        }
        .hub-card h3 { font-size: 1.8rem; font-weight: 900; margin: 1.5rem 0 0.5rem; color: var(--clay-text); }
        .hub-card p { font-size: 0.95rem; color: var(--clay-text-dim); line-height: 1.4; margin-bottom: 2rem; flex-grow: 1; }
        .hub-card-icon { width: 6rem; height: 6rem; background: var(--clay-bg); border-radius: 2rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--clay-shadow-in); color: var(--primary); }
        
        .hub-card-action { 
          background: var(--primary); 
          color: white; 
          padding: 1rem 2rem; 
          border-radius: 1.2rem; 
          font-weight: 900; 
          font-size: 0.9rem; 
          box-shadow: 0 10px 20px var(--primary-shadow);
        }
        
        .host-card:hover .hub-card-icon { color: var(--accent); }
        .join-card:hover .hub-card-icon { color: #2ecc71; }
        
        .hub-join-container { width: 100%; max-width: 400px; text-align: center; }
        .hub-back-btn { background: none; border: none; color: var(--clay-text-dim); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
        .hub-join-card { padding: 4rem 2rem 3rem; }
        .hub-card-icon-mini { font-size: 3rem; margin-bottom: 2rem; color: var(--primary); display: flex; justify-content: center; }
        .hub-code-input { width: 100%; background: var(--clay-bg); border: none; box-shadow: var(--clay-shadow-in); padding: 1.2rem; border-radius: 1.5rem; font-size: 2.5rem; font-weight: 900; text-align: center; letter-spacing: 0.8rem; color: var(--primary); outline: none; margin-top: 1.5rem; }
        
        .hub-error { color: var(--accent); margin-top: 2rem; font-weight: 800; }
        .hub-error-mini { color: var(--accent); margin-top: 1rem; font-weight: 700; font-size: 0.85rem; }
        .mt-2 { margin-top: 2rem; }
        .w-full { width: 100%; }
      `}} />
    </div>
  );
};

export default JoinArena;
