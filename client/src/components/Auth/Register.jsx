import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const Register = ({ onLogin, onSwitch, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      console.error('Auth Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <motion.div 
      className="auth-compact-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="clay-card auth-card-compact">
        <button className="back-btn-clay" onClick={onBack} title="Back to Welcome">
          <ArrowLeft size={20} />
        </button>
        
        <div className="auth-hero-mini floating">
          <div className="icon-platform-mini">
            <img src="/clay_trophy.png" alt="Trophy" />
          </div>
        </div>

        <div className="auth-header-compact">
          <h1 className="cartoon-title-sm">Join Arena</h1>
          <p className="text-dim-sm">Embark on your journey!</p>
        </div>
        
        <form className="mt-2" onSubmit={handleSubmit}>
          <div className="clay-field-sm">
            <label><User size={14} /> Warrior Name</label>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="clay-field-sm mt-1">
            <label><Mail size={14} /> Email Address</label>
            <input 
              type="email" 
              placeholder="warrior@grind.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="clay-field-sm mt-1">
            <label><Lock size={14} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          {error && <div className="error-box-sm">{error}</div>}
          
          <button className="clay-btn clay-btn-primary mt-2 w-full active-scale" type="submit">
            START BATTLE <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="auth-footer-compact mt-2">
          <button className="link-btn-sm" onClick={onSwitch}>ALREADY A WARRIOR? LOGIN</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-compact-container { width: 100%; display: flex; justify-content: center; align-items: center; }
        .auth-card-compact { width: 100%; max-width: 380px; padding: 3.5rem 1.5rem 1.5rem; position: relative; overflow: visible; }
        .auth-hero-mini { position: absolute; top: -3.5rem; left: 50%; transform: translateX(-50%); z-index: 20; }
        .icon-platform-mini { 
          width: 7rem; 
          height: 7rem; 
          background: white; 
          border-radius: 2rem; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: var(--clay-shadow-out);
          padding: 0.8rem;
        }
        .icon-platform-mini img { width: 100%; height: 100%; object-fit: contain; }
        .auth-header-compact { text-align: center; margin-bottom: 1rem; }
        .cartoon-title-sm { font-size: 2rem; font-weight: 900; color: var(--clay-text); line-height: 1; margin-bottom: 0.3rem; }
        .text-dim-sm { font-size: 0.9rem; color: var(--clay-text-dim); }
        .clay-field-sm label { font-size: 0.8rem; font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--clay-text-dim); }
        .clay-field-sm input { width: 100%; padding: 1rem; font-size: 0.95rem; border: none; border-radius: 1.2rem; background: var(--clay-field-bg); color: var(--clay-text); box-shadow: var(--clay-field-shadow); transition: all 0.2s ease; }
        .error-box-sm { color: var(--accent); font-size: 0.8rem; margin-top: 1rem; font-weight: 700; text-align: center; }
        .auth-footer-compact { text-align: center; padding-top: 1rem; border-top: 1px dashed rgba(0,0,0,0.1); }
        .link-btn-sm { background: none; border: none; color: var(--primary); font-weight: 900; font-size: 0.75rem; cursor: pointer; letter-spacing: 0.05rem; }
        .mt-1 { margin-top: 1rem; }
        .mt-2 { margin-top: 2rem; }
        .w-full { width: 100%; }
        .active-scale:active { transform: scale(0.96); }

        .back-btn-clay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 2.2rem;
          height: 2.2rem;
          background: var(--clay-card);
          border: none;
          border-radius: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--clay-shadow-out);
          cursor: pointer;
          color: var(--clay-text-dim);
          transition: all 0.2s ease;
          z-index: 30;
        }
        .back-btn-clay:hover {
          transform: translateY(-2px);
          color: var(--primary);
        }
        .back-btn-clay:active {
          transform: translateY(0) scale(0.9);
          box-shadow: var(--clay-shadow-in);
        }
      `}} />
    </motion.div>
  );
};

export default Register;
