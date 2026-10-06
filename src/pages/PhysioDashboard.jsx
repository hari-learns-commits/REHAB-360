import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRehabData } from '../context/RehabDataContext';
import { getAthleteWorkoutHistory } from '../services/workoutPlanService';
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
  Plus,
  Trash2,
  CheckCircle2,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

const PhysioDashboard = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const {
    workoutPlan,
    updateWorkoutPlan,
    workoutLogs,
    requestPhaseProgression,
    orthoClearance
  } = useRehabData();

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

  // Telemetry History State
  const [sessions, setSessions] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      const history = await getAthleteWorkoutHistory('ATH-202');
      setSessions(history);
      if (history.length > 0) setActiveReport(history[0]);
    }
    loadSessions();
  }, []);

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
    alert("Rehabilitation program updated successfully for Alex Morgan!");
  };

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      {/* Header Bar */}
      <header className="flex justify-between items-center py-4 px-6 bg-slate-900 border-b border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <ProfileAvatarSelector
            currentAvatar={currentUser?.avatar}
            onSelectAvatar={(av) => updateUserProfile({ avatar: av })}
            size="md"
          />
          <div>
            <h1 className="text-xl font-bold">Physiotherapist Clinical Workspace</h1>
            <p className="text-xs text-slate-400">Assigned Athlete: <strong>Alex Morgan</strong> (ACL Reconstruction - Phase 2)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 bg-slate-900/60 p-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('program_builder')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'program_builder' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity size={16} /> Program Builder
        </button>
        <button
          onClick={() => setActiveTab('telemetry_review')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'telemetry_review' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={16} /> MediaPipe Rep & AI Telemetry
        </button>
        <button
          onClick={() => setActiveTab('video_telemetry')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'video_telemetry' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video size={16} /> Synchronized Video Telemetry
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === 'program_builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-white">
                <h2 className="text-lg font-bold text-amber-400">Prescribe Rehabilitation Program</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Rehab Phase Name</label>
                    <input
                      type="text"
                      value={phaseName}
                      onChange={(e) => setPhaseName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Weekly Goal Focus</label>
                    <input
                      type="text"
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-300">Add Exercise Protocol</h3>
                  <form onSubmit={handleAddExercise} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Exercise Title"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Sets x Reps (e.g. 3 x 12)"
                      value={`${newExSets} sets x ${newExReps} reps`}
                      onChange={(e) => setNewExReps(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <button type="submit" className="btn-primary flex items-center justify-center gap-1 text-xs py-2">
                      <Plus size={14} /> Add Protocol
                    </button>
                  </form>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-slate-300">Prescribed Exercises ({exercises.length})</h3>
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs">
                      <div>
                        <strong className="text-white">{ex.name || ex.title}</strong>
                        <p className="text-slate-400">{ex.sets} sets x {ex.reps} reps • {ex.notes || ex.instructions}</p>
                      </div>
                      <button onClick={() => handleRemoveExercise(ex.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveProgram} className="w-full btn-primary text-xs py-2.5 mt-4" style={{ background: 'var(--primary)' }}>
                  Save & Push Program to Athlete
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <UnifiedTimeline role="physio" />
            </div>
          </div>
        )}

        {activeTab === 'telemetry_review' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">MediaPipe Kinematic Telemetry & AI Review</h2>
                <p className="text-xs text-slate-400">Rep-level duration, concentric velocity slowdown (fatigue index), and logged form faults</p>
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                {sessions.length} Logged Sessions Available
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions List */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Athlete Workout Telemetry</h3>
                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => setActiveReport(sess)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                        activeReport?.id === sess.id
                          ? 'border-amber-500 bg-slate-900'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-white capitalize flex items-center gap-2">
                          {sess.exercise_id.replace('_', ' ')}
                          <span className="text-xs font-normal text-slate-400">({new Date(sess.created_at).toLocaleTimeString()})</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Avg Rep Tempo: <strong>{(sess.avg_tempo_ms / 1000).toFixed(1)}s</strong>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <div className="text-xs text-slate-400">Total Reps</div>
                          <div className="text-sm font-mono font-bold text-emerald-400">{sess.total_reps}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Fatigue Index</div>
                          <div className="text-sm font-mono font-bold text-amber-400">+{sess.fatigue_index_pct}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Biomechanical Evaluation Drawer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-white">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} color="var(--primary)" /> AI Biomechanical Evaluation
                </h3>
                {activeReport ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                      <div className="text-slate-400 font-semibold mb-1">Logged Form Flaws:</div>
                      <div className="font-mono text-amber-400">
                        {Object.keys(activeReport.fault_summary || {}).length > 0
                          ? Object.entries(activeReport.fault_summary)
                              .map(([fault, count]) => `${fault} (${count}x)`)
                              .join(', ')
                          : 'Clean Form (Zero Flaws Detected)'}
                      </div>
                    </div>
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-1">
                      {activeReport.ai_summary_markdown}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs italic">
                    Select a session from the list to inspect clinical feedback.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video_telemetry' && (
          <div className="space-y-6">
            <SynchronizedVideoTelemetryPlayer />
          </div>
        )}
      </div>

      <AppBottomNav />
    </div>
  );
};

export default PhysioDashboard;
