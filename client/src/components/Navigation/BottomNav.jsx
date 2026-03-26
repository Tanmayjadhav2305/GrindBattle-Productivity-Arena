import React from 'react';
import { Trophy, Home, PlusCircle, User, BarChart2 } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'arena', label: 'Arena', icon: Trophy },
    { id: 'my-stats', label: 'My Stats', icon: BarChart2 },
    { id: 'log', label: 'Log Progress', icon: PlusCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="nav-icon-wrapper">
              <Icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </div>
            <span>{tab.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNav;
