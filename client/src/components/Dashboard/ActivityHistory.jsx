import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, BookOpen } from 'lucide-react';

const ActivityHistory = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        console.warn('History data is not an array:', res.data);
        setLogs([]);
      }
    } catch (err) {
      console.error('History Error:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div 
      className="history-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="history-content clay-card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="history-header">
          <h2 className="cartoon-title">Warrior's Journal</h2>
          <button className="clay-btn-sm close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="history-scroll-area">
          {loading ? (
            <div className="text-center p-3">⚔️ Loading your journey...</div>
          ) : logs.length === 0 ? (
            <div className="text-center p-3 text-dim">No history recorded yet. Start your first grind!</div>
          ) : (
            logs.map((log, i) => (
              <motion.div 
                key={log._id} 
                className="history-item clay-card shadow-in"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="history-item-top">
                  <div className="date-badge">
                    <Calendar size={14} />
                    <span>{formatDate(log.date)}</span>
                  </div>
                  <div className="stats-badges">
                    {log.startTime && (
                      <div className="time-badge">
                        <span>{log.startTime} - {log.endTime || '??'}</span>
                      </div>
                    )}
                    <div className="hour-badge">
                      <Clock size={14} />
                      <span>{(log.hours).toFixed(1)}h</span>
                    </div>
                  </div>
                </div>

                {log.category && (
                  <div className="category-pill">{log.category}</div>
                )}

                <div className="history-tasks">
                  <BookOpen size={16} color="var(--primary)" />
                  <div className="tasks-list">
                    {log.tasks.length > 0 ? (
                      log.tasks.map((t, idx) => <span key={idx} className="task-tag">{t}</span>)
                    ) : (
                      <span className="text-dim">No specific tasks recorded.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .history-overlay { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: rgba(0,0,0,0.4); 
          backdrop-filter: blur(8px); 
          z-index: 2000; 
          display: flex; align-items: center; justify-content: center; 
          padding: 1.5rem;
        }
        .history-content { 
          width: 100%; max-width: 500px; height: 80vh; 
          display: flex; flex-direction: column; overflow: hidden;
          padding: 1.5rem;
        }
        .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .history-scroll-area { 
          flex: 1; overflow-y: auto; padding-right: 0.5rem; 
          display: flex; flex-direction: column; gap: 1.2rem;
        }
        .history-item { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem; border-radius: 1.5rem; flex-shrink: 0; }
        .history-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .date-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: var(--clay-text-dim); }
        .stats-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
        .time-badge { background: var(--clay-bg); color: var(--clay-text); padding: 0.2rem 0.6rem; border-radius: 0.8rem; font-size: 0.7rem; font-weight: 700; box-shadow: var(--clay-shadow-in); }
        .hour-badge { background: var(--primary); color: white; padding: 0.2rem 0.6rem; border-radius: 0.8rem; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.3rem; }
        .category-pill { align-self: flex-start; background: var(--secondary); color: white; padding: 0.2rem 0.8rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .history-tasks { display: flex; gap: 0.6rem; align-items: flex-start; }
        .tasks-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .task-tag { background: rgba(0,0,0,0.05); padding: 0.2rem 0.6rem; border-radius: 0.6rem; font-size: 0.75rem; color: var(--clay-text); font-weight: 600; }
        .close-btn { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; }
      `}} />
    </motion.div>
  );
};

export default ActivityHistory;
