import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CarRace = React.memo(({ players }) => {
  const maxPoints = useMemo(() => Math.max(...players.map(p => p.totalPoints), 100), [players]);

  const markers = useMemo(() => {
    const mks = [];
    for(let m = 0; m <= maxPoints; m += 50) {
      mks.push(m);
    }
    return mks;
  }, [maxPoints]);

  return (
    <div className="clay-arena">
      <div className="vertical-track">
        {players.map((player, idx) => {
          const progress = (player.totalPoints / maxPoints) * 100;
          const isLeader = player.totalPoints === maxPoints && player.totalPoints > 0;
          

          return (
            <div key={player._id} className="racing-lane">
              <div className="lane-background">
                {markers.map(m => (
                  <div 
                    key={m} 
                    className="lane-marker" 
                    style={{ bottom: `${(m / maxPoints) * 100}%` }}
                  >
                    <span className="marker-label">{m / 10}h</span>
                  </div>
                ))}
              </div>
              <motion.div 
                className={`clay-car-wrapper ${isLeader ? 'leader-glow' : ''}`}
                initial={{ bottom: '10%' }}
                animate={{ bottom: `${10 + progress * 0.6}%` }} 
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              >
                  <div className="car-avatar-wrapper shadow-out">
                    {isLeader && <div className="leader-trophy">🏆</div>}
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${player.avatarSeed || player._id}`} 
                      alt="Driver" 
                      className="driver-img"
                    />
                  </div>
                  <div className="car-shadow"></div>
                  <div className="player-badge-mini">
                    <strong>{player.name}</strong>
                    <span className="pts-label">{(player.totalPoints / 10).toFixed(1)}h</span>
                    {isLeader && '👑'}
                  </div>
                </motion.div>
              </div>
            );
        })}
        <div className="finish-goal">🏆</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .clay-arena { height: 400px; padding: 1rem; position: relative; }
        .vertical-track { 
          height: 100%; 
          display: flex; 
          justify-content: space-around; 
          background: var(--track); 
          border-radius: 2rem; 
          box-shadow: inset 5px 5px 10px rgba(0,0,0,0.1), inset -5px -5px 10px rgba(255,255,255,0.1);
          padding: 2rem 0;
          position: relative;
        }
        .racing-lane { width: 4rem; height: 100%; position: relative; }
        .lane-background { 
          position: absolute; left: 50%; transform: translateX(-50%); 
          width: 0.5rem; height: 100%; 
          background: rgba(0,0,0,0.1); 
          border-radius: 1rem;
        }
        .lane-marker { position: absolute; left: 50%; transform: translateX(-50%); width: 2rem; height: 2px; background: rgba(0,0,0,0.2); }
        .marker-label { position: absolute; left: 2.5rem; transform: translateY(-50%); font-size: 0.6rem; color: var(--clay-text-dim); font-weight: 800; white-space: nowrap; }
        .clay-car-wrapper { position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; z-index: 10; margin-bottom: -1rem; }
        .car-avatar-wrapper { 
          width: 3.5rem; height: 3.5rem; 
          background: var(--clay-bg); 
          border-radius: 1rem; 
          padding: 0.3rem;
          display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
          animation: floating 3s ease-in-out infinite;
        }
        .driver-img { width: 100%; height: 100%; object-fit: contain; }
        @keyframes floating { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
        .leader-glow { filter: drop-shadow(0 0 15px rgba(251, 197, 49, 0.6)); }
        .leader-trophy { position: absolute; top: -1.5rem; left: 50%; transform: translateX(-50%); font-size: 1.5rem; animation: trophy-bounce 1s ease-in-out infinite; z-index: 20; }
        @keyframes trophy-bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
        .car-shadow { width: 2rem; height: 0.5rem; background: rgba(0,0,0,0.1); border-radius: 50%; margin-top: -0.5rem; }
        .player-badge-mini { background: var(--clay-card); padding: 0.35rem 0.75rem; border-radius: 0.75rem; font-size: 0.7rem; font-weight: 700; margin-top: 0.5rem; box-shadow: var(--clay-shadow-out); display: flex; flex-direction: column; align-items: center; gap: 0.1rem; min-width: 4rem; z-index: 50; }
        .pts-label { color: var(--primary); font-size: 0.65rem; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 0.1rem; width: 100%; text-align: center; }
        .finish-goal { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); font-size: 2rem; filter: drop-shadow(0 0 10px gold); z-index: 5; }
      `}} />
    </div>
  );
});

export default CarRace;
