import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  Trophy, 
  UploadCloud 
} from 'lucide-react';

export const Sidebar = ({ collapsed, mobileOpen, closeMobile }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-badge">
          <GraduationCap size={22} />
        </div>
        {!collapsed && (
          <div className="logo-info">
            <h2>EduAnalytics</h2>
            <p>Performance System</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Main</div>}
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink 
          to="/students" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Students"
        >
          <Users size={18} />
          {!collapsed && <span>Students</span>}
        </NavLink>
        <NavLink 
          to="/subjects" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Subjects"
        >
          <BookOpen size={18} />
          {!collapsed && <span>Subjects</span>}
        </NavLink>
        <NavLink 
          to="/results" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Results"
        >
          <ClipboardCheck size={18} />
          {!collapsed && <span>Results</span>}
        </NavLink>

        {!collapsed && <div className="nav-section-title">Analytics</div>}
        <NavLink 
          to="/analysis" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Analysis"
        >
          <BarChart3 size={18} />
          {!collapsed && <span>Analysis</span>}
        </NavLink>
        <NavLink 
          to="/rankings" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Class Rankings"
        >
          <Trophy size={18} />
          {!collapsed && <span>Class Rankings</span>}
        </NavLink>
        <NavLink 
          to="/upload" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMobile}
          title="Upload Data"
        >
          <UploadCloud size={18} />
          {!collapsed && <span>Upload Data</span>}
        </NavLink>
      </nav>
    </aside>
  );
};
