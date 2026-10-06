import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, ShieldCheck, Stethoscope, Activity, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, targetRole = null }) => {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(targetRole || 'athlete'); // 'athlete', 'physio', 'ortho'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleQuickFill = (role) => {
    if (role === 'athlete') {
      setUsername('alex');
      setPassword('password123');
    } else if (role === 'physio') {
      setUsername('physio');
      setPassword('password123');
    } else {
      setUsername('ortho');
      setPassword('password123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username || activeTab, password, activeTab);
    if (result.success) {
      onClose();
      if (result.user.role === 'athlete') navigate('/athlete');
      else if (result.user.role === 'physio') navigate('/physio');
      else navigate('/ortho');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.5rem', color: '#fff' }}>
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-bold text-main">Rehab360 Secure Login</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        {/* Role Tab Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.35rem',
            background: '#f1f5f9',
            padding: '0.3rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('athlete'); handleQuickFill('athlete'); }}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'athlete' ? '#ffffff' : 'transparent',
              color: activeTab === 'athlete' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'athlete' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <User size={14} /> Athlete
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('physio'); handleQuickFill('physio'); }}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'physio' ? '#ffffff' : 'transparent',
              color: activeTab === 'physio' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'physio' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <Activity size={14} /> Physio
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('ortho'); handleQuickFill('ortho'); }}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'ortho' ? '#ffffff' : 'transparent',
              color: activeTab === 'ortho' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'ortho' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <Stethoscope size={14} /> Ortho
          </button>
        </div>

        {authError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-muted mb-1 block">
              {activeTab === 'athlete' ? 'Athlete Username / Email' : activeTab === 'physio' ? 'Physiotherapist ID' : 'Orthopedic Surgeon Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeTab === 'athlete' ? 'alex' : activeTab === 'physio' ? 'physio' : 'ortho'}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                  borderRadius: '0.6rem',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted mb-1 block">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                  borderRadius: '0.6rem',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            <LogIn size={18} /> Login to {activeTab.toUpperCase()} Portal
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <span className="text-xs text-muted">
            Quick Auto-Fill Demo Accounts: <br />
            <button onClick={() => { setActiveTab('athlete'); handleQuickFill('athlete'); }} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Athlete (alex)</button> • {' '}
            <button onClick={() => { setActiveTab('physio'); handleQuickFill('physio'); }} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Physio (physio)</button> • {' '}
            <button onClick={() => { setActiveTab('ortho'); handleQuickFill('ortho'); }} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Ortho (ortho)</button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
