import React from 'react';
import PersonalStats from './Dashboard/PersonalStats';
import { motion } from 'framer-motion';
import CarRace from './Visualization/CarRace';
import { Trophy, Users } from 'lucide-react';

const Arena = ({ user, data }) => {
  const opponent = data.find(u => u._id !== user._id);
  const currentUser = data.find(u => u._id === user._id) || user;
  const pointsDiff = (currentUser.totalPoints || 0) - (opponent?.totalPoints || 0);

  return (
    <div className="arena-page">
      <motion.div 
        className="header-cartoon"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="cartoon-title">Arena Battle</h1>
        <p className="text-dim">Real-time competition</p>
      </motion.div>

      <div className="arena-grid">
        <div className="clay-card track-card">
          <div className="card-top">
            <Trophy size={20} color="var(--primary)" />
            <span>Speedway Battle</span>
          </div>
          <CarRace players={data} />
        </div>

        <div className="clay-card leaderboard-card mt-2">
          <div className="card-top">
            <Users size={20} color="var(--secondary)" />
            <span>Leaderboard</span>
          </div>
          <div className="leader-rows">
            {data.sort((a,b) => b.totalPoints - a.totalPoints).map((p, i) => (
              <div key={p._id} className="leader-row flex-center">
                <span className="rank-sm">{i === 0 ? '🥇' : '🥈'}</span>
                <div className="mini-avatar-wrapper shadow-in">
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${p.avatarSeed || p._id}`} alt="Avatar" className="mini-avatar" />
                </div>
                <span className="name">{p.name} {p._id === user._id && '(You)'}</span>
                <span className="pts">{(p.totalPoints / 10).toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-card status-box mt-2">
          {pointsDiff >= 0 ? (
            <div style={{ color: 'var(--success)', fontWeight: 700 }}>🚀 You are winning by {pointsDiff} points!</div>
          ) : (
            <div style={{ color: 'var(--accent)', fontWeight: 700 }}>🔥 You're trailing by {Math.abs(pointsDiff)} points. Push!</div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .header-cartoon { margin-bottom: 2rem; }
        .card-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-weight: 700; font-size: 0.9rem; }
        .leader-rows { display: flex; flex-direction: column; gap: 0.8rem; }
        .leader-row { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem; border-radius: 1.2rem; background: rgba(255,255,255,0.05); }
        .rank-sm { font-size: 1.1rem; width: 1.5rem; text-align: center; }
        .mini-avatar-wrapper { width: 2.2rem; height: 2.2rem; background: var(--clay-bg); border-radius: 0.6rem; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 0.2rem; }
        .mini-avatar { width: 100%; height: 100%; object-fit: contain; }
        .leader-row .name { font-weight: 600; flex: 1; font-size: 0.9rem; }
        .leader-row .pts { font-weight: 800; color: var(--primary); font-size: 0.9rem; }
        .flex-center { display: flex; align-items: center; }
        .status-box { text-align: center; padding: 1.2rem; margin-bottom: 2rem; }
        .mt-2 { margin-top: 1.5rem; }
      `}} />
    </div>
  );
};

export default Arena;
