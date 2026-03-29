import React from 'react';
import { Home, BarChart2, PlusCircle, User, LogOut, Trophy } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const items = [
    { id: 'arena', icon: <Home size={22} />, label: 'Arena Hub' },
    { id: 'my-stats', icon: <BarChart2 size={22} />, label: 'Personal Stats' },
    { id: 'log', icon: <PlusCircle size={22} />, label: 'Log Progress' },
    { id: 'profile', icon: <User size={22} />, label: 'My Champion' }
  ];

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <Trophy size={32} className="floating" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '1.4rem', letterSpacing: '0.1rem' }}>BATTLE LOG</div>
      </div>
      
      <nav className="sidebar-nav-list" style={{ flex: 1 }}>
        {items.map(item => (
          <div 
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-item" onClick={onLogout} style={{ marginTop: 'auto', color: 'var(--accent)', borderTop: '2px dashed rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
        <LogOut size={22} />
        <span>Sign Out</span>
      </div>
    </aside>
  );
};

export default Sidebar;
