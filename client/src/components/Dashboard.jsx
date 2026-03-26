import React from 'react';
import { motion } from 'framer-motion';
import CarRace from './Visualization/CarRace';
import LogForm from './LogForm';
import Analytics from './Analytics/AdvancedCharts';
import { Zap, Target, Flame } from 'lucide-react';

const Dashboard = ({ user, data }) => {
  const opponent = data.find(u => u.username !== user.username);
  const currentUser = data.find(u => u.username === user.username) || user;

  const pointsDiff = currentUser.totalPoints - (opponent?.totalPoints || 0);

  return (
    <div className="dashboard">
      <header className="glass-card header">
        <h1 className="neon-text">GRINDBATTLE ARENA</h1>
        <div className="user-summary">
          <div className="stat">
            <Flame className={currentUser.momentum === 'On Fire' ? 'neon-text' : ''} />
            <span>{currentUser.currentStreak} Day Streak</span>
          </div>
          <div className="stat">
            <Zap className="neon-text" />
            <span>{currentUser.totalPoints} Points</span>
          </div>
        </div>
      </header>

      <div className="main-grid">
        <div className="left-panel">
          <LogForm user={currentUser} />
          <Analytics username={currentUser.username} />
        </div>

        <div className="right-panel">
          <div className="race-track glass-card neon-border">
            <h2>The Competition</h2>
            <CarRace players={data} />
            <div className="momentum-badge">
              {pointsDiff > 0 ? (
                <span className="rising">🚀 Ahead by {pointsDiff} pts</span>
              ) : (
                <span className="dropping">⚠️ Behind by {Math.abs(pointsDiff)} pts</span>
              )}
            </div>
          </div>
          
          <div className="stats-comparison glass-card">
            <h3>Head-to-Head</h3>
            <div className="compare-row">
              <div className="competitor">
                <h4>{currentUser.name} (You)</h4>
                <p>Today: {currentUser.todayStats?.hours || 0} hrs</p>
                <div className="momentum-tag">{currentUser.momentum}</div>
              </div>
              <div className="vs">VS</div>
              <div className="competitor">
                <h4>{opponent?.name || 'Waiting...'}</h4>
                <p>Today: {opponent?.todayStats?.hours || 0} hrs</p>
                <div className="momentum-tag">{opponent?.momentum}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
