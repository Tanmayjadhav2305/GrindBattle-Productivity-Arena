import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const Welcome = ({ onStart }) => {
  return (
    <div className="welcome-page">
      <motion.div 
        className="welcome-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-image-container">
          <motion.img 
            src="/clay_warrior_hero.png" 
            alt="Clay Warriors" 
            className="hero-img floating"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          />
          <div className="hero-blob"></div>
        </div>

        <div className="text-section">
          <motion.h1 
            className="welcome-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome to <br/><span>GrindBattle</span>
          </motion.h1>
          <motion.p 
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Log your daily grind, sync with friends, <br/>and dominate the arena together.
          </motion.p>

          <motion.button 
            className="clay-btn get-started-btn"
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Get Started <ChevronRight size={24} />
          </motion.button>
        </div>

        <motion.div 
          className="welcome-copyright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Designed and Developed by <span>Tanmay & Siddhesh</span>
        </motion.div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .welcome-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--clay-background);
          overflow: hidden;
          padding: 2rem;
        }
        .welcome-content {
          text-align: center;
          width: 100%;
          max-width: 500px;
        }
        .hero-image-container {
          position: relative;
          margin-bottom: 4rem;
        }
        .hero-img {
          width: 100%;
          max-width: 320px;
          height: auto;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
        }
        .hero-blob {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 280px;
          background: var(--primary-glow);
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          filter: blur(40px);
          opacity: 0.4;
          z-index: 1;
        }
        .welcome-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 1.5rem;
          color: var(--clay-text);
        }
        .welcome-title span {
          color: var(--primary);
        }
        .welcome-subtitle {
          font-size: 1.1rem;
          color: var(--clay-text-dim);
          line-height: 1.6;
          margin-bottom: 3.5rem;
        }
        .get-started-btn {
          width: 100%;
          background: var(--primary) !important;
          color: white !important;
          padding: 1.5rem !important;
          font-size: 1.25rem !important;
          box-shadow: 0 15px 30px var(--primary-glow) !important;
          margin-bottom: 3rem;
        }
        .welcome-copyright {
          font-size: 0.75rem;
          color: var(--clay-text-dim);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          opacity: 0.6;
        }
        .welcome-copyright span {
          color: var(--primary);
          font-weight: 900;
        }
      `}} />
    </div>
  );
};

export default Welcome;
