import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRehabData } from '../context/RehabDataContext';
import UnifiedTimeline from '../components/UnifiedTimeline';
import WhatsAppChat from '../components/WhatsAppChat';
import SynchronizedVideoTelemetryPlayer from '../components/SynchronizedVideoTelemetryPlayer';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import ProfileAvatarSelector from '../components/ProfileAvatarSelector';
import AppBottomNav from '../components/AppBottomNav';
import { getAthleteWorkoutHistory } from '../services/workoutPlanService';
import {
  Activity,
  Video,
  TrendingUp,
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const PhysioDashboard = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const {
    workoutPlan,
    updateWorkoutPlan,
    workoutLogs,
    sendMessage,
    addVideoAnnotation,
    videoAnnotations,
    requestPhaseProgression
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

  // Telemetry Review State
  const [historySessions, setHistorySessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTelemetryReport, setActiveTelemetryReport] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true);
      const res = await getAthleteWorkoutHistory('ATH-202');
      setHistorySessions(res);
      if (res.length > 0) setActiveTelemetryReport(res[0]);
      setLoadingHistory(false);
    }
    loadHistory();
  }, []);

  // Video Analysis State
  const selectedLog = workoutLogs[0] || null;
  const [annotationNote, setAnnotationNote] = useState('');
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

  const handleSaveProgram = () => {
    updateWorkoutPlan({
      ...workoutPlan,
      phaseName,
      weeklyGoal,
      exercises
    });
    alert("Workout program updated and synced directly to Athlete Portal!");
  };

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

  const handlePhaseRequestSubmit = (e) => {
    e.preventDefault();
    requestPhaseProgression(targetPhase, romAchieved, painAvg, currentUser?.name || "Dr. Sarah Jenkins, PT");
    setProgressionSubmitted(true);
    setTimeout(() => setProgressionSubmitted(false), 4000);
  };

  const physioSidebarItems = [
    { id: 'program_builder', label: 'Workout Builder', icon: Activity },
    { id: 'telemetry_review', label: 'Telemetry & Rep AI', icon: Sparkles },
    { id: 'video_analysis', label: 'Video Form Analysis', icon: Video },
    { id: 'analytics', label: 'Micro-Progression', icon: TrendingUp },
    { id: 'messaging', label: 'Form Messages & Calls', icon: MessageSquare },
    { id: 'phase_progression', label: 'Phase Requests', icon: ArrowRight },
    { id: 'timeline', label: 'Unified Timeline', icon: CheckCircle2 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const physioBottomNavItems = [
    { id: 'program_builder', shortLabel: 'Program', icon: Activity },
    { id: 'telemetry_review', shortLabel: 'Telemetry', icon: Sparkles },
    { id: 'video_analysis', shortLabel: 'Video', icon: Video },
    { id: 'analytics', shortLabel: 'Reports', icon: TrendingUp },
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
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    fontWeight: isActive ? '700' : '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <IconComp size={18} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-content" style={{ flex: 1, minWidth: 0 }}>

        {/* TAB 1: WORKOUT PROGRAM BUILDER */}
        {activeTab === 'program_builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card flex flex-col gap-6" style={{ padding: '2.5rem' }}>
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-color pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-main">Prescribed Rehabilitation Program</h2>
                  <p className="text-base text-muted mt-1">Directly authored by Physio & Doctor for Alex Morgan</p>
                </div>
                <button onClick={handleSaveProgram} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                  Save & Sync to Athlete Portal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Rehabilitation Phase</label>
                  <input
                    type="text"
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-main mb-1 block">Weekly Clinical Focus</label>
                  <input
                    type="text"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-lg font-bold text-main">Active Exercise List ({exercises.length})</h3>
                {exercises.map((ex, index) => (
                  <div key={ex.id} className="p-4 flex justify-between items-start" style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary text-sm">#{index + 1}</span>
                        <h4 className="font-bold text-main text-base">{ex.name}</h4>
                      </div>
                      <span className="text-sm text-muted font-medium">
                        {ex.sets} sets x {ex.reps} reps | Tempo: {ex.tempo} | Load: {ex.load}
                      </span>
                      {ex.notes && (
                        <span className="text-xs font-bold text-primary block mt-2">
                          💡 Note: {ex.notes}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleRemoveExercise(ex.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
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

                <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  Add to Draft Plan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY & REP AI REVIEW */}
        {activeTab === 'telemetry_review' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
                <h2 className="text-xl font-bold text-main flex items-center gap-2">
                  <Sparkles size={22} color="var(--primary)" /> Athlete Kinematic Telemetry & Rep Logs
                </h2>
                <p className="text-xs text-muted mt-1">Real-time MediaPipe Rep Count, Time Under Tension & Fatigue Index % History</p>
              </div>

              <div className="flex flex-col gap-3">
                {loadingHistory ? (
                  <div className="text-muted p-4">Loading telemetry sessions...</div>
                ) : historySessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setActiveTelemetryReport(sess)}
                    className="glass-card flex justify-between items-center p-4 cursor-pointer"
                    style={{
                      borderLeft: activeTelemetryReport?.id === sess.id ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                      background: activeTelemetryReport?.id === sess.id ? 'rgba(249, 115, 22, 0.05)' : '#ffffff'
                    }}
                  >
                    <div>
                      <h4 className="font-bold text-base text-main capitalize">{sess.exercise_id?.replace('_', ' ')}</h4>
                      <span className="text-xs text-muted">{new Date(sess.created_at).toLocaleString()}</span>
                    </div>

                    <div className="flex gap-4 text-right">
                      <div>
                        <span className="text-xs text-muted block">Reps</span>
                        <strong className="text-primary text-base font-bold">{sess.total_reps}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-muted block">Fatigue Index</span>
                        <strong className="text-amber-600 text-base font-bold">+{sess.fatigue_index_pct}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Report Detail Drawer */}
            <div className="glass-card" style={{ padding: '1.75rem', height: 'fit-content' }}>
              <h3 className="text-base font-bold text-main mb-3 flex items-center gap-2">
                <Sparkles size={18} color="var(--primary)" /> AI Biomechanical Evaluation
              </h3>

              {activeTelemetryReport ? (
                <div className="flex flex-col gap-3 text-xs text-muted">
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Logged Form Faults:</strong>
                    <div className="text-amber-600 font-bold mt-1">
                      {Object.keys(activeTelemetryReport.fault_summary || {}).length > 0
                        ? Object.entries(activeTelemetryReport.fault_summary).map(([f, c]) => `${f} (${c}x)`).join(', ')
                        : 'None detected (Clean Form)'}
                    </div>
                  </div>

                  <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {activeTelemetryReport.ai_summary_markdown}
                  </div>
                </div>
              ) : (
                <div className="text-muted text-xs">Select a session from the list to view report details.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO FORM ANALYSIS & ATHLETE EXERCISE LOG BREAKDOWN */}
        {activeTab === 'video_analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h2 className="text-2xl font-bold text-main mb-2">Dedicated Video Form Analysis & Telemetry</h2>
                <p className="text-base text-muted mb-6">Slow-motion playback & synchronous joint telemetry</p>

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

              {/* ATHLETE PUSHED EXERCISE BREAKDOWN CARD (VIDEO PROOFS & SKIP REASONS) */}
              {selectedLog && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2 border-b border-color pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-main flex items-center gap-2">
                        <Sparkles size={18} color="var(--primary)" /> Pushed Session Exercise Breakdown
                      </h3>
                      <p className="text-xs text-muted">Recorded video proofs and logged skip reasons submitted by Alex Morgan</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      Session ID: {selectedLog.sessionId || 'SESS-9921'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedLog.recordedExerciseProofs && Object.keys(selectedLog.recordedExerciseProofs).length > 0 ? (
                      Object.values(selectedLog.recordedExerciseProofs).map((exProof, idx) => (
                        <div
                          key={exProof.exerciseId || idx}
                          className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          style={{
                            background: exProof.status === 'skipped' ? '#fffbeb' : '#fafafa',
                            borderRadius: 'var(--radius-md)',
                            border: exProof.status === 'skipped' ? '1px solid #fde68a' : '1px solid #e2e8f0'
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary text-sm">#{idx + 1}</span>
                              <h4 className="font-bold text-main text-base">{exProof.exerciseName}</h4>
                            </div>

                            {exProof.status === 'skipped' ? (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                                  ⚠️ Skipped by Athlete
                                </span>
                                <span className="text-xs text-amber-900 font-semibold">
                                  Reason: {exProof.skipReasonLabel}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted mt-1 flex flex-wrap gap-3">
                                <span>ROM: <strong className="text-main">{exProof.romDegrees}°</strong></span>
                                <span>Symmetry: <strong className="text-main">{exProof.symmetryPercent}%</strong></span>
                                <span>Valgus: <strong className="text-main">{exProof.valgusAngle}°</strong></span>
                                <span>Reps: <strong className="text-main">{exProof.repsCompleted}</strong></span>
                              </div>
                            )}
                          </div>

                          <div>
                            {exProof.status === 'skipped' ? (
                              <span className="text-xs text-amber-700 italic font-semibold">
                                Action required: Review athlete loading capacity
                              </span>
                            ) : exProof.recordedVideoUrl ? (
                              <a
                                href={exProof.recordedVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-outline text-xs flex items-center gap-1.5"
                                style={{ padding: '0.4rem 0.85rem' }}
                              >
                                <Video size={14} color="var(--primary)" /> View Exercise Video →
                              </a>
                            ) : (
                              <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded border border-green-200">
                                Video Logged ✓
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-muted bg-slate-50 rounded-lg">
                        Prescribed Exercises: <strong>Bodyweight Squat, Bicep Curl, Overhead Press</strong> (Pushed telemetry & video proofs synced).
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
              <h3 className="text-lg font-bold text-main mb-6">Video Markups & Clinical Notes</h3>
              <form onSubmit={handleAddAnnotation} className="flex flex-col gap-4 mb-8">
                <textarea
                  rows={3}
                  placeholder="Leave clinical observation or feedback for athlete..."
                  value={annotationNote}
                  onChange={(e) => setAnnotationNote(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.9rem' }}>
                  Add Timestamp Note
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileAvatarSelector currentUser={currentUser} onUpdateProfile={updateUserProfile} />
        )}

        {/* TAB 5: UNIFIED TIMELINE */}
        {activeTab === 'timeline' && <UnifiedTimeline />}

        {/* TAB 6: MESSAGING */}
        {activeTab === 'messaging' && <WhatsAppChat activeRole="physio" athleteName="Alex Morgan" doctorName="Dr. Valli" />}

      </main>

      <AppBottomNav items={physioBottomNavItems} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default PhysioDashboard;
