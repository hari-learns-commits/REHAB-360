import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="strava-footer">
      <div className="strava-footer-grid">
        {/* Left Logo Column */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Rehab360 AI Logo" style={{ width: '28px', height: '28px' }} />
            <span style={{ color: 'var(--strava-orange)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              REHAB360
            </span>
          </Link>
          <span className="text-xs text-muted">© 2026 Rehab360 AI, Inc.</span>
        </div>

        {/* Column 1: About */}
        <div className="strava-footer-col">
          <h5>About</h5>
          <a href="#about">About Us</a>
          <a href="#features">Features</a>
          <a href="#mobile">Mobile App</a>
          <a href="#subscription">Clinical Subscription</a>
          <a href="#clinical-standards">Clinical Standards</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>

        {/* Column 2: Portals */}
        <div className="strava-footer-col">
          <h5>Explore</h5>
          <Link to="/athlete">Athlete Portal</Link>
          <Link to="/physio">Physiotherapist Hub</Link>
          <Link to="/ortho">Ortho Clearance Vault</Link>
          <a href="#pose-tracking">3D Pose Tracking</a>
          <a href="#ai-readiness">AI Readiness Engine</a>
        </div>

        {/* Column 3: Follow */}
        <div className="strava-footer-col">
          <h5>Follow</h5>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="#stories">Athlete Stories</a>
        </div>

        {/* Column 4: Help */}
        <div className="strava-footer-col">
          <h5>Help</h5>
          <a href="#support">Rehab360 Support</a>
          <a href="#docs">Clinical Documentation</a>
          <a href="#contact">Contact Surgeon</a>
          <a href="#faq">FAQ</a>
        </div>

        {/* Column 5: More */}
        <div className="strava-footer-col">
          <h5>More</h5>
          <a href="#careers">Careers</a>
          <a href="#press">Press</a>
          <a href="#badge">Verified Badge</a>
          <a href="#developers">Developers API</a>
          
          <div className="mt-4">
            <select
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                color: 'var(--text-dark)',
                cursor: 'pointer'
              }}
              defaultValue="en"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
