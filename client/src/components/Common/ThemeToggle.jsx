import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="theme-toggle-fixed">
      <button 
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--primary)" />}
      </button>
    </div>
  );
};

export default ThemeToggle;
