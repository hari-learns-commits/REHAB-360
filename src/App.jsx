import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Bell, LogIn, LogOut, Menu, X, User, Activity, Stethoscope, Compass } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RehabDataProvider } from './context/RehabDataContext';
import AvatarPlaceholder from './components/AvatarPlaceholder';
import StravaMegaMenu from './components/StravaMegaMenu';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import AthleteDashboard from './pages/AthleteDashboard';
import PhysioDashboard from './pages/PhysioDashboard';
import OrthoDashboard from './pages/OrthoDashboard';

// Modals
import LoginModal from './components/LoginModal';

const StravaHeader = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, switchRole } = useAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowMegaMenu(false);
    if (location.pathname.startsWith('/athlete')) {
      switchRole('athlete');
    } else if (location.pathname.startsWith('/physio')) {
      switchRole('physio');
    } else if (location.pathname.startsWith('/ortho')) {
      switchRole('ortho');
    }
  }, [location.pathname]);

  const handleOpenLogin = (role = null) => {
    setLoginTargetRole(role);
    setIsLoginOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="strava-header">
        <div className="flex items-center gap-8">
          {/* Rehab360 Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <img
              src="/logo.svg"
              alt="Rehab360 AI Logo"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            <span style={{ color: 'var(--strava-orange)', fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.02em', fontFamily: 'Inter' }}>
              REHAB360 <span style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.85rem' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Links (Inspired by Template Image 1 & 2) */}
          <nav className="flex items-center gap-1 hide-on-mobile" style={{ position: 'relative' }}>
            <div
              onMouseEnter={() => setShowMegaMenu(true)}
              style={{ display: 'inline-block' }}
            >
              <button
                className={`strava-nav-link ${location.pathname !== '/' ? 'active' : ''}`}
                onClick={() => setShowMegaMenu(!showMegaMenu)}
              >
                <span>Portals</span>
                {showMegaMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showMegaMenu && <StravaMegaMenu onClose={() => setShowMegaMenu(false)} />}
            </div>

            <Link
              to="/athlete"
              className={`strava-nav-link ${location.pathname === '/athlete' ? 'active' : ''}`}
            >
              Athlete
            </Link>

            <Link
              to="/physio"
              className={`strava-nav-link ${location.pathname === '/physio' ? 'active' : ''}`}
            >
              Physio
            </Link>

            <Link
              to="/ortho"
              className={`strava-nav-link ${location.pathname === '/ortho' ? 'active' : ''}`}
            >
              Ortho
            </Link>
          </nav>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-4">
          <button title="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} className="hide-on-mobile">
            <Bell size={18} />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <AvatarPlaceholder src={currentUser.avatar} name={currentUser.name} size={30} />
              <div className="flex flex-col text-left hide-on-mobile">
                <span className="text-xs font-bold text-dark">{currentUser.name}</span>
                <span className="text-xs text-muted" style={{ fontSize: '0.65rem' }}>
                  {currentUser.role === 'ortho' ? 'Ortho Surgeon' : currentUser.role === 'physio' ? 'Physiotherapist' : 'Athlete'}
                </span>
              </div>
              <button onClick={handleLogout} title="Log Out" style={{ background: 'none', border: 'none', color: 'var(--strava-orange)', cursor: 'pointer', padding: '0.2rem' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => handleOpenLogin()} className="btn-outline" style={{ padding: '0.4rem 1.1rem', fontSize: '0.825rem' }}>
              Log In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', padding: '0.25rem' }}
            className="mobile-menu-trigger"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            left: '0',
            right: '0',
            background: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 1.25rem',
            zIndex: 199,
            boxShadow: 'var(--shadow-dropdown)'
          }}
        >
          <div className="flex flex-col gap-3">
            <Link to="/athlete" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-bold text-dark p-2">
              <User size={18} color="var(--strava-orange)" /> Athlete Portal
            </Link>
            <Link to="/physio" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-bold text-dark p-2">
              <Activity size={18} color="var(--strava-orange)" /> Physiotherapist Dashboard
            </Link>
            <Link to="/ortho" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-bold text-dark p-2">
              <Stethoscope size={18} color="var(--strava-orange)" /> Orthopedic Specialist View
            </Link>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        targetRole={loginTargetRole}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <RehabDataProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen w-full" style={{ background: 'var(--bg-body)' }}>
            <StravaHeader />
            <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/athlete" element={<AthleteDashboard />} />
                <Route path="/physio" element={<PhysioDashboard />} />
                <Route path="/ortho" element={<OrthoDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </RehabDataProvider>
    </AuthProvider>
  );
}

export default App;
