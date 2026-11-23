import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const titles = {
  '/': 'Dashboard',
  '/students': 'Student Management',
  '/subjects': 'Subjects',
  '/results': 'Exam Results',
  '/analysis': 'Performance Analysis',
  '/rankings': 'Class Rankings & Leaderboard',
  '/upload': 'Bulk Data Import',
};

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/students/')) {
      return 'Student Profile';
    }
    return titles[location.pathname] || 'EduAnalytics';
  };

  return (
    <div className="app-layout">
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        closeMobile={() => setMobileOpen(false)} 
      />
      <div className="main-wrapper">
        <Navbar 
          toggleSidebar={() => {
            if (window.innerWidth <= 992) {
              setMobileOpen(!mobileOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }} 
          pageTitle={getTitle()} 
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
