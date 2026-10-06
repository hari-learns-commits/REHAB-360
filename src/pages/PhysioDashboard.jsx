import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRehabData } from '../context/RehabDataContext';
import UnifiedTimeline from '../components/UnifiedTimeline';
import WhatsAppChat from '../components/WhatsAppChat';
import SynchronizedVideoTelemetryPlayer from '../components/SynchronizedVideoTelemetryPlayer';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import ProfileAvatarSelector from '../components/ProfileAvatarSelector';
import AppBottomNav from '../components/AppBottomNav';
import {
  Activity,
  Video,
  TrendingUp,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Phone,
  ArrowRight,
  User,
  LogOut,
  Upload
} from 'lucide-react';

const PhysioDashboard = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const {
    workoutPlan,
    updateWorkoutPlan,
    workoutLogs,
    messages,
    sendMessage,
    callRequests,
    updateCallStatus,
    addVideoAnnotation,
    videoAnnotations,
    requestPhaseProgression,
    orthoClearance
  } = useRehabData();

  // Active Physio Sidebar Tab
  const [activeTab, setActiveTab] = useState('program_builder');

  // Workout Builder State
  const [phaseName, setPhaseName] = useState(workoutPlan.phaseName || "Phase 2: Neuromuscular Control");
  const [weeklyGoal, setWeeklyGoal] = useState(workoutPlan.weeklyGoal || "Focus on active knee extension and landing mechanics");
  const [exercises, setExercises] = useState(workoutPlan.exercises || []);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExTempo, setNewExTempo] = useState('3-1-1');
  const [newExLoad, setNewExLoad] = useState('Bodyweight');
  const [newExNotes, setNewExNotes] = useState('Focus on knee tracking');

  // Video Analysis State
  const selectedLog = workoutLogs[0] || null;
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAngleOverlay, setShowAngleOverlay] = useState(true);
  const [annotationNote, setAnnotationNote] = useState('');

  // Form Correction Message State
  const [videoLinkedMsg, setVideoLinkedMsg] = useState('');

  // Phase Progression Request Form
  const [targetPhase, setTargetPhase] = useState("Phase 3: Dynamic Agility & Plyometrics");
  const [romAchieved, setRomAchieved] = useState("120°");
  const [painAvg, setPainAvg] = useState("1.8 / 10");
  const [progressionSubmitted, setProgressionSubmitted] = useState(false);

  // Add Exercise to Program
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const newEx = {
      id: `ex-${Date.now()}`,
      name: newExName,
      sets: Number(newExSets),
      reps: Number(newExReps),
      tempo: newExTempo,
      load: newExLoad,
      notes: newExNotes
    };
    setExercises([...exercises, newEx]);
    setNewExName('');
  };

  const handleRemoveExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  // Save Workout Program to Shared State
  const handleSaveProgram = () => {
    updateWorkoutPlan({
      ...workoutPlan,
      phaseName,
      weeklyGoal,
      exercises
    });
    alert("Workout program updated and synced directly to Athlete Portal!");
  };

  // Submit Video Annotation
  const handleAddAnnotation = (e) => {
    e.preventDefault();
    if (!annotationNote.trim() || !selectedLog) return;
    addVideoAnnotation({
      id: `ann-${Date.now()}`,
      sessionId: selectedLog.sessionId,
      timestamp: "00:04",
      exerciseName: selectedLog.completedExercises?.[0]?.name || "Squats",
      note: annotationNote,
      author: currentUser?.name || "Dr. Sarah Jenkins, PT",
      createdAt: new Date().toISOString()
    });
    setAnnotationNote('');
  };

  // Submit Video-Linked Message
  const handleSendVideoMessage = (e) => {
    e.preventDefault();
    if (!videoLinkedMsg.trim()) return;
    sendMessage(`[Form Note on Tuesday Video]: "${videoLinkedMsg}"`, 'physio', currentUser?.name || "Dr. Sarah Jenkins, PT");
    setVideoLinkedMsg('');
    alert("Form correction message sent to athlete!");
  };

  // Submit Phase Progression Request to Ortho
  const handlePhaseRequestSubmit = (e) => {
    e.preventDefault();
    requestPhaseProgression(targetPhase, romAchieved, painAvg, currentUser?.name || "Dr. Sarah Jenkins, PT");
    setProgressionSubmitted(true);
    setTimeout(() => setProgressionSubmitted(false), 4000);
  };

  const physioSidebarItems = [
    { id: 'program_builder', label: 'Workout Builder', icon: Activity },
    { id: 'video_analysis', label: 'Video Form Analysis', icon: Video },
    { id: 'analytics', label: 'Micro-Progression', icon: TrendingUp },
    { id: 'messaging', label: 'Form Messages & Calls', icon: MessageSquare },
    { id: 'phase_progression', label: 'Phase Requests', icon: ArrowRight },
    { id: 'timeline', label: 'Unified Timeline', icon: CheckCircle2 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const physioBottomNavItems = [
    { id: 'program_builder', shortLabel: 'Program', icon: Activity },
    { id: 'video_analysis', shortLabel: 'Video', icon: Video },
    { id: 'analytics', shortLabel: 'Reports', icon: TrendingUp },
    { id: 'messaging', shortLabel: 'Chat', icon: MessageSquare },
    { id: 'profile', shortLabel: 'Profile', icon: User }
  ];

  return (
    <div className="dashboard-shell">
      {/* PHYSIOTHERAPIST STICKY SIDEBAR (DESKTOP) */}
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
          {/* Physio Header Profile Badge */}
          <div className="flex items-center gap-3 mb-5 p-3" style={{ background: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
            <AvatarPlaceholder src={currentUser?.avatar} name={currentUser?.name || 'Dr. Sarah Jenkins, PT'} size={42} />
            <div style={{ overflow: 'hidden' }}>
              <h4 className="text-sm font-bold text-main" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {currentUser?.name || "Dr. Sarah Jenkins, PT"}
              </h4>
              <span className="text-xs text-primary font-semibold block">
                {currentUser?.roleTitle || "Lead Physical Therapist"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {physioSidebarItems.map((item) => {
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
                    boxShadow: isActive ? '0 4px 12px rgba(255, 85, 0, 0.25)' : 'none'
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

        {/* TAB 1: WORKOUT PROGRAM BUILDER */}
      {activeTab === 'program_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card" style={{ padding: '2.5rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-main">Interactive Routine Builder</h2>
              <button onClick={handleSaveProgram} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                <Check size={18} /> Save & Push to Athlete
              </button>
            </div>

            <div className="flex flex-col gap-6 mb-8">
              <div>
                <label className="text-sm font-bold text-main mb-2 block">Phase Name</label>
                <input
                  type="text"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-main mb-2 block">Weekly Prescription Goal</label>
                <input
                  type="text"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Prescribed Exercises List */}
            <h3 className="text-lg font-bold text-main mb-4">Prescribed Exercise Routines</h3>
            <div className="flex flex-col gap-4">
              {exercises.map((ex, index) => (
                <div
                  key={ex.id || index}
                  className="p-5 flex justify-between items-start gap-4"
                  style={{
                    background: '#fafafa',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                    <h4 className="text-base font-bold text-main">{ex.name}</h4>
                    <span className="text-sm text-muted block mt-1">
                      Sets: <strong>{ex.sets}</strong> | Reps: <strong>{ex.reps}</strong> | Tempo: <strong>{ex.tempo}</strong> | Load: <strong>{ex.load}</strong>
                    </span>
                    {ex.notes && (
                      <span className="text-xs font-bold text-primary block mt-2" style={{ wordBreak: 'break-word' }}>
                        💡 Note: {ex.notes}
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleRemoveExercise(ex.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Exercise Card */}
          <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
            <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <Plus size={20} color="var(--primary)" /> Add Exercise Routine
            </h3>
            <form onSubmit={handleAddExercise} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-main mb-1 block">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Single-Leg Eccentric Squats"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Sets</label>
                  <input
                    type="number"
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Reps</label>
                  <input
                    type="number"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Tempo</label>
                  <input
                    type="text"
                    value={newExTempo}
                    onChange={(e) => setNewExTempo(e.target.value)}
                    placeholder="3-1-1"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Load</label>
                  <input
                    type="text"
                    value={newExLoad}
                    onChange={(e) => setNewExLoad(e.target.value)}
                    placeholder="Bodyweight"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-main mb-1 block">Constraints / Cues</label>
                <input
                  type="text"
                  value={newExNotes}
                  onChange={(e) => setNewExNotes(e.target.value)}
                  placeholder="Keep knee over 2nd toe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Add to Draft Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO FORM ANALYSIS */}
      {activeTab === 'video_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card" style={{ padding: '2.5rem' }}>
            <h2 className="text-2xl font-bold text-main mb-2">Dedicated Video Form Analysis</h2>
            <p className="text-base text-muted mb-6">Slow-motion playback, joint angle measurement, and synchronized biomechanical telemetry</p>

            {selectedLog ? (
              <SynchronizedVideoTelemetryPlayer
                videoUrl={selectedLog.videoProofUrl}
                telemetryData={selectedLog.telemetryData || []}
                sessionTitle={`Workout Proof (${selectedLog.readinessBadgeText || 'Live Audit'})`}
                athleteName={selectedLog.athleteName || 'Alex Morgan'}
                date={selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
              />
            ) : (
              <div className="text-center p-8 text-muted">No athlete video proof uploaded yet.</div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
            <h3 className="text-lg font-bold text-main mb-6">Video Markups & Biomechanical Notes</h3>

            <form onSubmit={handleAddAnnotation} className="flex flex-col gap-4 mb-8">
              <textarea
                rows={3}
                placeholder="Leave note tied to timestamp (e.g., 'Shift weight further back on heels')..."
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.9rem' }}>
                Add Timestamp Note
              </button>
            </form>

            <h4 className="text-sm font-bold text-main mb-3">Saved Video Annotations</h4>
            <div className="flex flex-col gap-3">
              {videoAnnotations.map((ann) => (
                <div key={ann.id} className="p-4" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between text-xs font-bold text-primary mb-1">
                    <span>{ann.exerciseName} [{ann.timestamp}]</span>
                    <span>{ann.author}</span>
                  </div>
                  <p className="text-sm text-muted">{ann.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MICRO-PROGRESSION ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-8">
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h2 className="text-2xl font-bold text-main mb-2">Micro-Progression Metrics Dashboard</h2>
            <p className="text-base text-muted mb-8">Daily & weekly Range of Motion (ROM), subjective pain trends, and kinetic capacity</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                <span className="text-xs font-bold text-muted block mb-1">Active Range of Motion (Flexion)</span>
                <span className="text-3xl font-extrabold text-main">118°</span>
                <p className="text-xs text-primary font-bold mt-2">↑ +12° progress over last 14 days</p>
              </div>

              <div className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                <span className="text-xs font-bold text-muted block mb-1">Avg Pain Score (7-Day Rolling)</span>
                <span className="text-3xl font-extrabold text-main">1.8 / 10</span>
                <p className="text-xs text-primary font-bold mt-2">↓ Decreased from 3.5 / 10 baseline</p>
              </div>

              <div className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                <span className="text-xs font-bold text-muted block mb-1">Strength Capacity Index</span>
                <span className="text-3xl font-extrabold text-main">84%</span>
                <p className="text-xs text-primary font-bold mt-2">Optimal muscular endurance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FORM MESSAGING & CALLS */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WhatsAppChat
              currentUser={{ role: 'physio', name: currentUser?.name || 'Dr. Sarah Jenkins, PT' }}
              recipient={{
                name: "Alex Morgan",
                role: "Patient / Athlete",
                status: "Online • Active Now",
                avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AlexMorgan&backgroundColor=ffdfbf"
              }}
              messages={messages}
              onSendMessage={(text) => sendMessage(text, 'physio', currentUser?.name || 'Dr. Sarah Jenkins, PT')}
            />
          </div>

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 className="text-xl font-bold text-main mb-2">Manage Athlete Call Requests</h3>
            <p className="text-base text-muted mb-6">Approve or decline video consultation requests</p>

            <div className="flex flex-col gap-4">
              {callRequests.map((c) => (
                <div key={c.id} className="p-5" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-main">{c.athleteName}</h4>
                      <span className="text-xs text-muted block mt-1">{c.topic} ({c.requestedDate} @ {c.requestedTime})</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        background: c.status === 'approved' ? 'var(--primary-light)' : '#fef3c7',
                        color: c.status === 'approved' ? 'var(--primary)' : '#b45309'
                      }}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  {c.status === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => updateCallStatus(c.id, 'approved', currentUser?.name || 'Dr. Sarah Jenkins, PT')}
                        className="btn-primary"
                        style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}
                      >
                        Approve Call
                      </button>
                      <button
                        onClick={() => updateCallStatus(c.id, 'declined', currentUser?.name || 'Dr. Sarah Jenkins, PT')}
                        className="btn-outline"
                        style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PHASE PROGRESSION REQUESTS */}
      {activeTab === 'phase_progression' && (
        <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="text-2xl font-bold text-main mb-2">Flag Athlete Phase Progression</h2>
          <p className="text-base text-muted mb-8">
            Flag when an athlete is ready to advance to the next rehab phase. This sends a formal request to Dr. Valli (Orthopedic Specialist) for review.
          </p>

          {progressionSubmitted && (
            <div className="p-4 mb-6 text-sm font-bold text-primary bg-orange-50 rounded-md border border-orange-200">
              ✓ Phase progression request sent to Orthopedic Specialist!
            </div>
          )}

          <form onSubmit={handlePhaseRequestSubmit} className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-bold text-main mb-2 block">Current Phase</label>
              <input
                type="text"
                disabled
                value={orthoClearance.currentPhase}
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-main mb-2 block">Target Phase to Progress</label>
              <input
                type="text"
                value={targetPhase}
                onChange={(e) => setTargetPhase(e.target.value)}
                required
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-main mb-2 block">Achieved Range of Motion (ROM)</label>
                <input
                  type="text"
                  value={romAchieved}
                  onChange={(e) => setRomAchieved(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-main mb-2 block">Average Pain Level</label>
                <input
                  type="text"
                  value={painAvg}
                  onChange={(e) => setPainAvg(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}>
              Send Progression Flag to Orthopedic Specialist
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: UNIFIED TIMELINE */}
      {activeTab === 'timeline' && <UnifiedTimeline />}

      {/* TAB 7: PROFILE */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 className="text-xl font-bold text-main mb-2">Physiotherapist Profile Settings</h2>
            <p className="text-sm text-muted mb-6">Manage professional credentials, clinic info, and profile picture attachment</p>

            {/* Profile Avatar Selection Section */}
            <div className="mb-6">
              <ProfileAvatarSelector
                currentAvatar={currentUser?.avatar}
                userName={currentUser?.name || "Dr. Sarah Jenkins, PT"}
                role="physio"
                onUpdateAvatar={(newAvatar) => updateUserProfile({ avatar: newAvatar }, 'physio')}
              />
            </div>

            {/* Professional Credentials */}
            <h3 className="text-base font-bold text-main mb-4">Clinical Information & Assigned Patients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Primary Clinic</span>
                <span className="text-sm font-bold text-main">{currentUser?.clinic || "Rehab360 Sports Performance Lab"}</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Active Assigned Patient</span>
                <span className="text-sm font-bold text-main">Alex Morgan (ACL Reconstruction)</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Supervising Orthopedic Surgeon</span>
                <span className="text-sm font-bold text-main">Dr. Valli (Chief of Sports Medicine)</span>
              </div>

              <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-xs font-bold text-muted">Active Treatment Phase</span>
                <span className="text-sm font-bold text-main">{orthoClearance?.currentPhase}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>

      <AppBottomNav
        items={physioBottomNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default PhysioDashboard;
