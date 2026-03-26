import React from 'react';
import AdvancedCharts from '../Analytics/AdvancedCharts';
import { Flame, Zap, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const PersonalStats = ({ user }) => {
  const cards = [
    { label: 'Total Hours', value: (user.totalPoints / 10).toFixed(1), icon: Zap, color: '#fbc531', suffix: 'h' },
    { label: 'Weekly Trophies', value: user.weeklyTrophies || 0, icon: Trophy, color: '#f9ca24', suffix: '' },
    { label: 'Current Streak', value: user.currentStreak, icon: Flame, color: '#e84118', suffix: 'days' },
    { label: 'Momentum', value: user.momentum, icon: TrendingUp, color: '#00a8ff', suffix: '' },
  ];

  return (
    <div className="personal-stats-clay">
      <motion.div 
        className="user-header-clay"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="user-avatar-clay-wrapper floating shadow-out">
          <img 
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarSeed || user._id}`} 
            alt="User Avatar" 
            className="dicebear-img" 
          />
        </div>
        <h1 className="cartoon-title">{user.name}</h1>
        <p className="text-dim">Level {Math.floor(user.totalPoints / 100) + 1} Master</p>
      </motion.div>

      <div className="clay-stats-stack">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            className="clay-card stat-clay-card-wide"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-icon-box" style={{ background: card.color }}>
              <card.icon size={24} color="white" />
            </div>
            <div className="stat-content-box">
              <span className="label-cartoon">{card.label}</span>
              <div className="val-row">
                <span className="value-cartoon highlight-val" style={{ color: card.color }}>{card.value}</span>
                {card.suffix && <span className="val-suffix">{card.suffix}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="label-cartoon" style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>Performance Curve</h3>
        <AdvancedCharts userId={user._id} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .user-header-clay { text-align: center; margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; }
        .user-avatar-clay-wrapper { width: 10rem; height: 10rem; background: var(--clay-bg); border-radius: 2.5rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; padding: 0.8rem; }
        .dicebear-img { width: 100%; height: 100%; object-fit: contain; }
        .clay-stats-stack { display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem; }
        .stat-clay-card-wide { display: flex; align-items: center; gap: 2rem; padding: 1.5rem 2.5rem; border-radius: 2rem; }
        .stat-icon-box { width: 4rem; height: 4rem; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0,0,0,0.15); flex-shrink: 0; }
        .stat-content-box { display: flex; flex-direction: column; gap: 0.25rem; }
        .val-row { display: flex; align-items: baseline; gap: 0.5rem; }
        .value-cartoon.highlight-val { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(0,0,0,0.05)); }
        .val-suffix { font-weight: 700; font-size: 1rem; color: var(--clay-text-dim); }
        .mt-4 { margin-top: 4rem; }
      `}} />
    </div>
  );
};

export default PersonalStats;
