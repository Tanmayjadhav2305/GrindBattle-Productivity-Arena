import React, { useState } from 'react';
import axios from 'axios';
import { Clock, BookOpen, Send, CheckCircle } from 'lucide-react';

const LogForm = ({ user, onComplete, setupNotifications }) => {
  const [hours, setHours] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [task, setTask] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/log', {
        hours: Number(hours),
        tasks: [task],
        category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Trigger notification setup if not already enabled
      if (setupNotifications) {
        setupNotifications();
      }

      setSuccess(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="clay-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="success-emoji floating">✨</div>
        <h2 className="cartoon-title" style={{ color: 'var(--success)' }}>GREAT JOB!</h2>
        <p className="text-dim">Your progress is live in the arena.</p>
        <style dangerouslySetInnerHTML={{ __html: `.success-emoji { font-size: 5rem; margin-bottom: 1rem; }` }} />
      </div>
    );
  }

  return (
    <div className="log-page">
      <h1 className="cartoon-title">Daily Grind</h1>
      <p className="text-dim">Log your victories warrior!</p>
      
      <form className="clay-card mt-2 log-form-clay" onSubmit={handleSubmit}>
        <div className="clay-field">
          <label><Clock size={16} /> Duration (Hours)</label>
          <input 
            type="number" 
            value={hours} 
            onChange={(e) => setHours(e.target.value)} 
            placeholder="0.0" 
            required 
            step="0.5"
          />
        </div>
        
        <div className="clay-field mt-1">
          <label><BookOpen size={16} /> Discipline</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Web Dev</option>
            <option>DSA</option>
            <option>GATE</option>
            <option>Open Source</option>
          </select>
        </div>

        <div className="clay-field mt-1">
          <label>Achievement Unlocked</label>
          <textarea 
            rows="3"
            value={task} 
            onChange={(e) => setTask(e.target.value)} 
            placeholder="What exactly did you do?" 
            required
          />
        </div>

        <button className="clay-btn clay-btn-primary mt-2 w-full" type="submit" disabled={submitting}>
          {submitting ? 'SYNCING...' : 'SUBMIT GRIND'} <Send size={18} />
        </button>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .log-form-clay { padding: 2rem; }
        .clay-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .clay-field label { font-size: 0.8rem; font-weight: 700; color: var(--clay-text-dim); }
        input, select, textarea { 
          background: var(--clay-bg); 
          border: none; 
          border-radius: 1rem; 
          padding: 1rem; 
          color: var(--clay-text); 
          box-shadow: var(--clay-shadow-in); 
          outline: none;
          font-family: inherit;
        }
        .w-full { width: 100%; }
        .mt-1 { margin-top: 1rem; }
        .mt-2 { margin-top: 2rem; }
      `}} />
    </div>
  );
};

export default LogForm;
