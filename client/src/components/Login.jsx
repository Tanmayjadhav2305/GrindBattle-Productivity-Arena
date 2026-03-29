import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = ({ onLogin, onSwitch, onBack }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            <img src="/clay_zap.png" alt="Zap" />
          </div>
        </div>
        
        <div className="auth-header-compact">
          <h1 className="cartoon-title-sm">Welcome Back</h1>
          <p className="text-dim-sm">Ready for the grind?</p>
        </div>
        
        <form className="mt-2" onSubmit={handleSubmit}>
          <div className="clay-field-sm">
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
            ENTER ARENA <Zap size={18} />
          </button>
        </form>
        
        <div className="auth-footer-compact mt-2">
          <button className="link-btn-sm" onClick={onSwitch}>NEW WARRIOR? REGISTER</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
