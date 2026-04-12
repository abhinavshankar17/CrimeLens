import React from 'react';
import { NavLink } from 'react-router-dom';
import { ScanEye, Activity, Map, LayoutDashboard, FolderKanban } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <ScanEye size={28} color="var(--accent-cyan)" />
        <div>
          Crime<span>Lens</span>
        </div>
      </div>
      <div className="nav-links">
        <NavLink to="/analyze" className="nav-link" style={{display: 'flex', gap:'8px', alignItems:'center'}}>
          <Activity size={18} /> Analyze
        </NavLink>
        <NavLink to="/map" className="nav-link" style={{display: 'flex', gap:'8px', alignItems:'center'}}>
          <Map size={18} /> Crime Map
        </NavLink>
        <NavLink to="/cases" className="nav-link" style={{display: 'flex', gap:'8px', alignItems:'center'}}>
          <FolderKanban size={18} /> Cases
        </NavLink>
        <NavLink to="/dashboard" className="nav-link" style={{display: 'flex', gap:'8px', alignItems:'center'}}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
