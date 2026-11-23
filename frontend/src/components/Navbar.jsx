import React from 'react';
import { Menu, GraduationCap } from 'lucide-react';

export const Navbar = ({ toggleSidebar, pageTitle = 'Dashboard' }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>
      <div className="topbar-right">
        <div className="user-badge">
          <GraduationCap size={16} />
          <span>EduAnalytics Portal</span>
        </div>
      </div>
    </header>
  );
};
