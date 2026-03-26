import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RefreshCw, Save, X, Sparkles } from 'lucide-react';

const AvatarCustomizer = ({ user, onUpdate, onClose }) => {
  const [seed, setSeed] = useState(user.avatarSeed || Math.random().toString(36).substring(7));
  const [saving, setSaving] = useState(false);

  const generateNewSeed = () => {
    setSeed(Math.random().toString(36).substring(7));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/profile/update', { avatarSeed: seed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="customizer-overlay">
      <motion.div 
        className="clay-card customizer-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="dicebear-customizer">
          <div className="preview-section">
            <div className="avatar-canvas-lg shadow-in">
              <img src={avatarUrl} alt="Avatar Preview" className="dicebear-img" />
            </div>
            <h2 className="cartoon-title mt-1">Warrior Identity</h2>
          </div>

          <div className="control-section mt-2">
            <p className="text-dim text-center mb-1">Each seed generates a unique legendary warrior!</p>
            
            <button className="clay-btn w-full mb-1 flex-center" onClick={generateNewSeed}>
              RANDOMIZE <RefreshCw size={18} className="ml-1" />
            </button>

            <button className="clay-btn clay-btn-primary w-full mt-1 flex-center" onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING...' : 'LOCK IN IDENTITY'} <Sparkles size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .customizer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .customizer-modal { width: 100%; max-width: 450px; padding: 3rem 2rem 2rem; position: relative; }
        .close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--clay-text-dim); cursor: pointer; }
        
        .dicebear-customizer { display: flex; flex-direction: column; align-items: center; }
        .avatar-canvas-lg { width: 12rem; height: 12rem; background: var(--clay-bg); border-radius: 3rem; display: flex; align-items: center; justify-content: center; padding: 1rem; position: relative; overflow: hidden; }
        .dicebear-img { width: 100%; height: 100%; object-fit: contain; }
        
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .ml-1 { margin-left: 0.5rem; }
        .mb-1 { margin-bottom: 1rem; }
      `}} />
    </div>
  );
};

export default AvatarCustomizer;
