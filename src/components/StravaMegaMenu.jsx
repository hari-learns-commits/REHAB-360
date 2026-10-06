import React from 'react';
import { Link } from 'react-router-dom';
import { User, Activity, Stethoscope, ArrowRight } from 'lucide-react';

const StravaMegaMenu = ({ onClose }) => {
  return (
    <div className="strava-megamenu animate-fade-in" onMouseLeave={onClose}>
      {/* Left Column: Top Sports / Portals */}
      <div className="strava-megamenu-left">
        <span className="text-xs font-bold text-muted uppercase" style={{ letterSpacing: '0.04em' }}>
          Top Portals
        </span>

        <Link
          to="/athlete"
          onClick={onClose}
          className="flex items-center gap-2.5 text-sm font-bold text-dark hover:text-strava transition-all p-1.5"
        >
          <User size={18} color="var(--strava-orange)" />
          <span>Athlete Portal</span>
        </Link>

        <Link
          to="/physio"
          onClick={onClose}
          className="flex items-center gap-2.5 text-sm font-bold text-dark hover:text-strava transition-all p-1.5"
        >
          <Activity size={18} color="var(--strava-orange)" />
          <span>Physio Dashboard</span>
        </Link>

        <Link
          to="/ortho"
          onClick={onClose}
          className="flex items-center gap-2.5 text-sm font-bold text-dark hover:text-strava transition-all p-1.5"
        >
          <Stethoscope size={18} color="var(--strava-orange)" />
          <span>Ortho View</span>
        </Link>
      </div>

      {/* Right Column: Visual Preview Cards (Template Image 2) */}
      <div className="strava-megamenu-right">
        <Link to="/athlete" onClick={onClose} className="strava-megamenu-card">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80"
            alt="Athlete Running & Knee Rehab"
          />
          <span className="text-sm font-bold text-dark block text-center">Athlete Rehab</span>
        </Link>

        <Link to="/physio" onClick={onClose} className="strava-megamenu-card">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
            alt="Physiotherapy Exercise & Video Analysis"
          />
          <span className="text-sm font-bold text-dark block text-center">Video Analysis</span>
        </Link>

        <Link to="/ortho" onClick={onClose} className="strava-megamenu-card">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80"
            alt="Orthopedic Specialist Clearance"
          />
          <span className="text-sm font-bold text-dark block text-center">Ortho Clearance</span>
        </Link>
      </div>
    </div>
  );
};

export default StravaMegaMenu;
