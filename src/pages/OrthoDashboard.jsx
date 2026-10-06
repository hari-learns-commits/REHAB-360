import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRehabData } from '../context/RehabDataContext';
import UnifiedTimeline from '../components/UnifiedTimeline';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import ProfileAvatarSelector from '../components/ProfileAvatarSelector';
import AppBottomNav from '../components/AppBottomNav';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Upload,
  Check,
  User,
  LogOut,
  Trash2
} from 'lucide-react';

const OrthoDashboard = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const {
    orthoClearance,
    updateClearanceStatus,
    phaseProgressionRequests,
    approvePhaseProgression,
    redFlagAlerts,
    resolveRedFlag,
    diagnosticVault,
    clinicalNotes,
    addClinicalNote
  } = useRehabData();

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState('clearance_tracker');

  // Clearance Status Form State
  const [selectedClearance, setSelectedClearance] = useState(orthoClearance.clearanceStatus || "Cleared for Weight-Bearing & Light Jogging");
  const [newConstraint, setNewConstraint] = useState('');

  // Medical Constraints Form State for Phase Approval
  const [medicalConstraintInput, setMedicalConstraintInput] = useState('Do not exceed 120° knee flexion for next 10 days');

  // Clinical Note Form State
  const [newDoctorNote, setNewDoctorNote] = useState('');

  // Diagnostic File Upload Simulation
  const [newDiagTitle, setNewDiagTitle] = useState('');
  const [newDiagType, setNewDiagType] = useState('MRI Scan');
  const [newDiagNotes, setNewDiagNotes] = useState('');

  // Update Clearance Status
  const handleSaveClearance = (status) => {
    setSelectedClearance(status);
    updateClearanceStatus(status, newConstraint);
    setNewConstraint('');
    alert(`Clearance status updated to: "${status}"`);
  };

  // Approve Phase Progression Request
  const handleApprovePhase = (reqId) => {
    approvePhaseProgression(reqId, medicalConstraintInput);
    alert("Phase progression approved with medical constraints!");
  };

  // Add Clinical Note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newDoctorNote.trim()) return;
    addClinicalNote(currentUser?.name || "Dr. Valli", newDoctorNote);
    setNewDoctorNote('');
    alert("Clinical follow-up note saved!");
  };

  const orthoSidebarItems = [
    { id: 'clearance_tracker', label: 'Clearance Tracker', icon: ShieldCheck },
    { id: 'protocol_review', label: `Protocol Approvals (${phaseProgressionRequests.filter(r => r.status === 'pending_review').length})`, icon: CheckCircle },
    { id: 'diagnostic_vault', label: 'Diagnostic Vault', icon: FileText },
    { id: 'red_flags', label: `Red Flags (${redFlagAlerts.filter(f => f.status === 'unresolved').length})`, icon: AlertTriangle },
    { id: 'clinical_notes', label: 'Clinical Notes', icon: Stethoscope },
    { id: 'timeline', label: 'Unified Timeline', icon: CheckCircle },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const orthoBottomNavItems = [
    { id: 'clearance_tracker', shortLabel: 'Clearance', icon: ShieldCheck },
    { id: 'protocol_review', shortLabel: 'Approvals', icon: CheckCircle },
    { id: 'diagnostic_vault', shortLabel: 'Vault', icon: FileText },
    { id: 'clinical_notes', shortLabel: 'Notes', icon: Stethoscope },
    { id: 'profile', shortLabel: 'Profile', icon: User }
  ];

  return (
    <div className="dashboard-shell">
      {/* ORTHOPEDIC SPECIALIST STICKY SIDEBAR (DESKTOP) */}
      <aside
        className="glass-card desktop-sidebar"
        style={{
          padding: '1.25rem 1rem',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'fit-content'
        }}
      >
        <div>
          {/* Ortho Header Profile Badge */}
          <div className="flex items-center gap-3 mb-5 p-3" style={{ background: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
            <AvatarPlaceholder src={currentUser?.avatar} name={currentUser?.name || 'Dr. Valli'} size={42} />
            <div style={{ overflow: 'hidden' }}>
              <h4 className="text-sm font-bold text-main" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {currentUser?.name || "Dr. Valli"}
              </h4>
              <span className="text-xs text-primary font-semibold block">
                {currentUser?.roleTitle || "Chief Orthopedic Surgeon"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {orthoSidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '800' : '600',
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 4px 12px rgba(255, 107, 0, 0.25)' : 'none'
                  }}
                >
                  <IconComp size={18} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '2rem' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: '#fff1f2',
              color: '#e11d48',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-col gap-6" style={{ minWidth: 0 }}>

        {/* TAB 1: MILESTONE & CLEARANCE TRACKER */}
      {activeTab === 'clearance_tracker' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 glass-card" style={{ padding: '2.5rem' }}>
            <h2 className="text-2xl font-bold text-main mb-2">Milestone & Clearance Status Toggle</h2>
            <p className="text-base text-muted mb-8">Select active medical clearance tier for athlete Alex Morgan</p>

            <div className="flex flex-col gap-4 mb-8">
              {[
                { title: 'Rest Restricted', desc: 'No weight-bearing exercises allowed. Strict immobilization.' },
                { title: 'Cleared for Weight-Bearing', desc: 'Full weight-bearing allowed with closed-chain isometric exercises.' },
                { title: 'Cleared for Jogging', desc: 'Light straight-line treadmill jogging and non-contact drills cleared.' },
                { title: 'Cleared for Contact', desc: 'Full high-intensity competitive match play cleared.' }
              ].map((tier) => {
                const isSelected = orthoClearance.clearanceStatus.includes(tier.title) || selectedClearance === tier.title;
                return (
                  <div
                    key={tier.title}
                    onClick={() => handleSaveClearance(tier.title)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #f1f5f9',
                      background: isSelected ? 'var(--primary-light)' : '#fafafa',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div>
                      <h4 className="text-lg font-bold text-main">{tier.title}</h4>
                      <p className="text-sm text-muted mt-1">{tier.desc}</p>
                    </div>
                    {isSelected && <CheckCircle size={26} color="var(--primary)" />}
                  </div>
                );
              })}
            </div>

            {/* Medical Constraints List */}
            <h3 className="text-lg font-bold text-main mb-3">Active Medical Constraints (Ortho Enforced)</h3>
            <div className="flex flex-col gap-3">
              {orthoClearance.medicalConstraints?.map((c, idx) => (
                <div key={idx} className="p-4 text-sm font-semibold text-primary bg-orange-50 rounded-md border border-orange-200">
                  ⚠️ {c}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Athlete Overview Card */}
          <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
            <h3 className="text-lg font-bold text-main mb-6">Post-Op Timeline Milestone</h3>
            <div className="p-5 mb-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
              <span className="text-xs text-muted block mb-1">Elapsed Recovery</span>
              <span className="text-2xl font-bold text-main">Week 6 Post-Op</span>
              <span className="text-xs text-primary font-bold block mt-2">Graft Structural Healing: Normal</span>
            </div>

            <div className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
              <span className="text-xs text-muted block mb-1">Active Phase</span>
              <span className="text-base font-bold text-main">{orthoClearance.currentPhase}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROTOCOL REVIEW & APPROVAL */}
      {activeTab === 'protocol_review' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 className="text-2xl font-bold text-main mb-2">Protocol Review & Phase Approvals</h2>
          <p className="text-base text-muted mb-8">Review phase progression requests submitted by Physiotherapy lead</p>

          <div className="flex flex-col gap-6">
            {phaseProgressionRequests.map((req) => (
              <div key={req.id} className="p-6" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-main">Phase Progression Request: {req.targetPhase}</h3>
                    <span className="text-sm text-muted">Submitted by: {req.submittedBy} for Athlete {req.athleteName}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)', fontWeight: 800, background: req.status === 'approved' ? 'var(--primary-light)' : '#fef3c7', color: req.status === 'approved' ? 'var(--primary)' : '#b45309' }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted mb-6">
                  <span>Current Phase: <strong>{req.currentPhase}</strong></span>
                  <span>Achieved ROM: <strong>{req.romAchieved}</strong></span>
                  <span>Average Pain Score: <strong>{req.painAvg}</strong></span>
                </div>

                {req.status === 'pending_review' && (
                  <div className="flex flex-col gap-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <label className="text-sm font-bold text-main mb-2 block">Attach Medical Constraints / Flexion Limits</label>
                      <input
                        type="text"
                        value={medicalConstraintInput}
                        onChange={(e) => setMedicalConstraintInput(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleApprovePhase(req.id)} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                        <Check size={18} /> Approve Phase Movement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC & SURGICAL VAULT */}
      {activeTab === 'diagnostic_vault' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 glass-card" style={{ padding: '2.5rem' }}>
            <h2 className="text-2xl font-bold text-main mb-2">Diagnostic & Surgical Vault</h2>
            <p className="text-base text-muted mb-8">Upload and inspect X-Rays, MRI Scans, and Operative Surgical Notes</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {diagnosticVault.map((item) => (
                <div key={item.id} className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-primary">{item.type}</span>
                    <span className="text-xs text-muted">{item.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-main mb-3">{item.title}</h4>
                  {item.fileUrl && (
                    <img src={item.fileUrl} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} />
                  )}
                  <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{item.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Upload Form */}
          <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
            <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <Upload size={20} color="var(--primary)" /> Upload Imaging Document
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); alert("Diagnostic image uploaded to vault!"); }} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-main mb-1 block">Title</label>
                <input
                  type="text"
                  placeholder="Post-Op Week 6 X-Ray"
                  value={newDiagTitle}
                  onChange={(e) => setNewDiagTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-main mb-1 block">Type</label>
                <select
                  value={newDiagType}
                  onChange={(e) => setNewDiagType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="MRI Scan">MRI Scan</option>
                  <option value="X-Ray Imaging">X-Ray Imaging</option>
                  <option value="Operative Report">Operative Report</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-main mb-1 block">Surgical Notes</label>
                <textarea
                  rows={3}
                  value={newDiagNotes}
                  onChange={(e) => setNewDiagNotes(e.target.value)}
                  placeholder="Intact autograft integrity..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem' }}>
                Upload to Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: RED FLAG ALERTS */}
      {activeTab === 'red_flags' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 className="text-2xl font-bold text-main mb-2">Automated Red Flag Alerts</h2>
          <p className="text-base text-muted mb-8">Triggers for sudden pain spikes (≥ 7/10), mechanical locking, or joint instability</p>

          <div className="flex flex-col gap-4">
            {redFlagAlerts.map((flag) => (
              <div key={flag.id} className="p-5 flex justify-between items-center" style={{ background: flag.status === 'unresolved' ? '#fff7ed' : '#fafafa', borderRadius: 'var(--radius-md)', border: flag.status === 'unresolved' ? '1px solid #fed7aa' : '1px solid #f1f5f9' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={22} color="var(--primary)" />
                    <span className="text-base font-bold text-main">{flag.type} ({flag.athleteName})</span>
                  </div>
                  <p className="text-sm text-muted">{flag.details}</p>
                </div>

                {flag.status === 'unresolved' && (
                  <button onClick={() => resolveRedFlag(flag.id)} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                    Mark Reviewed
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CLINICAL NOTES INTEGRATION */}
      {activeTab === 'clinical_notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 className="text-xl font-bold text-main mb-2">Add Formal Clinical Note</h3>
            <p className="text-base text-muted mb-6">Add notes from in-person follow-up consultations accessible by Physiotherapy team</p>

            <form onSubmit={handleAddNote} className="flex flex-col gap-5">
              <textarea
                rows={5}
                value={newDoctorNote}
                onChange={(e) => setNewDoctorNote(e.target.value)}
                placeholder="Patient evaluated in clinic today. Lachman test negative. Quad strength 4+/5. Approved for Phase 2 progression..."
                required
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.9rem', fontSize: '0.95rem' }}>
                Save Formal Clinical Note
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 className="text-xl font-bold text-main mb-6">Saved Clinical Notes</h3>
            <div className="flex flex-col gap-4">
              {clinicalNotes.map((n) => (
                <div key={n.id} className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-primary">{n.doctorName}</span>
                    <span className="text-xs text-muted">{n.date}</span>
                  </div>
                  <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: UNIFIED TIMELINE */}
      {activeTab === 'timeline' && <UnifiedTimeline />}

      {/* TAB 7: PROFILE */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 className="text-xl font-bold text-main mb-2">Orthopedic Specialist Profile Settings</h2>
            <p className="text-sm text-muted mb-6">Manage surgical credentials, hospital affiliation, and profile picture attachment</p>

            {/* Profile Avatar Selection Section */}
            <div className="mb-6">
              <ProfileAvatarSelector
                currentAvatar={currentUser?.avatar}
                userName={currentUser?.name || "Dr. Valli, MD"}
                role="ortho"
                onUpdateAvatar={(newAvatar) => updateUserProfile({ avatar: newAvatar }, 'ortho')}
              />
            </div>

            {/* Surgical & Hospital Information */}
            <h3 className="text-base font-bold text-main mb-4">Surgical & Hospital Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Hospital Affiliation</span>
                <span className="text-sm font-bold text-main">{currentUser?.clinic || "Valli Orthopedic & Sports Institute"}</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Specialty</span>
                <span className="text-sm font-bold text-main">Arthroscopic ACL Reconstruction & Joint Preservation</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Lead Physiotherapy Partner</span>
                <span className="text-sm font-bold text-main">Dr. Sarah Jenkins, PT (Rehab360 Lead)</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Active Primary Patient</span>
                <span className="text-sm font-bold text-main">Alex Morgan (Post-Op Week 6)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>

      <AppBottomNav
        items={orthoBottomNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default OrthoDashboard;
