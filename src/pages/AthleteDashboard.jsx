import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRehabData } from '../context/RehabDataContext';
import { getGeminiAIInsights } from '../services/geminiService';
import { processWorkoutEndEndpoint } from '../services/aiReadinessService';
import DailyPerformanceGraph from '../components/DailyPerformanceGraph';
import WhatsAppChat from '../components/WhatsAppChat';
import MediaPipePoseTracker from '../components/MediaPipePoseTracker';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import ProfileAvatarSelector from '../components/ProfileAvatarSelector';
import AppBottomNav from '../components/AppBottomNav';
import {
  Home,
  Activity,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Video,
  Play,
  Upload,
  RefreshCw,
  Phone,
  Trash2,
  Save,
  Compass,
  ChevronRight
} from 'lucide-react';

const AthleteDashboard = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const {
    workoutPlan,
    workoutLogs,
    addWorkoutLog,
    messages,
    sendMessage,
    callRequests,
    requestCall,
    orthoClearance
  } = useRehabData();

  // Active Sidebar Tab State
  const [activeTab, setActiveTab] = useState('home');

  // Video Recording & Workout Logging State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('');
  const [painScore, setPainScore] = useState(2);
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [athleteNotes, setAthleteNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState(
    workoutPlan?.exercises?.map((e) => ({ ...e, completed: true })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sequential Multi-Exercise Video Recording Queue State
  const [recordedExerciseProofs, setRecordedExerciseProofs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const prescribedExercises = workoutPlan?.exercises?.map((ex, idx) => ({
    id: ex.id || (idx === 0 ? 'squat' : idx === 1 ? 'bicep_curl' : 'overhead_press'),
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    load: ex.load,
    tempo: ex.tempo,
    notes: ex.notes
  })) || [
    { id: 'squat', name: 'Bodyweight Squat', sets: 3, reps: 10, load: 'Bodyweight', tempo: '2-1-2' },
    { id: 'bicep_curl', name: 'Bicep Curl', sets: 3, reps: 12, load: '5kg Dumbbells', tempo: '2-0-2' },
    { id: 'overhead_press', name: 'Overhead Shoulder Press', sets: 3, reps: 10, load: '5kg Dumbbells', tempo: '2-0-2' }
  ];

  const totalPrescribedCount = prescribedExercises.length;
  const recordedCount = Object.keys(recordedExerciseProofs).length;
  const isAllExercisesRecorded = recordedCount >= totalPrescribedCount;

  // Handle saving individual exercise video proof & advancing queue
  const handleSaveExerciseSession = (sessionData) => {
    const activeEx = prescribedExercises[activeExerciseIndex] || prescribedExercises[0];
    const exId = sessionData.exerciseId || activeEx?.id || 'squat';
    const updatedProofs = {
      ...recordedExerciseProofs,
      [exId]: sessionData
    };
    setRecordedExerciseProofs(updatedProofs);
    setRecordedVideoUrl(sessionData.recordedVideoUrl);

    // Check off completed exercise in checklist
    setCompletedExercises(prev => prev.map(ex => (ex.id === exId || ex.name === activeEx.name) ? { ...ex, completed: true } : ex));

    const nextIndex = activeExerciseIndex + 1;
    if (nextIndex < prescribedExercises.length) {
      setActiveExerciseIndex(nextIndex);
      alert(`✓ Exercise ${activeExerciseIndex + 1}/${prescribedExercises.length} (${sessionData.exerciseName || activeEx.name}) video recorded!\n\nUnlocked Next Exercise: ${prescribedExercises[nextIndex].name}. Please record or upload video for Exercise ${nextIndex + 1}.`);
    } else {
      alert(`🎉 All ${prescribedExercises.length} prescribed exercise videos recorded!\n\nYou can now push the complete workout package and telemetry directly to your Doctor.`);
    }
  };

  // Gemini AI Insights State
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Messaging & Call Request State
  const [newMessageText, setNewMessageText] = useState('');
  const [callDate, setCallDate] = useState('2026-10-08');
  const [callTime, setCallTime] = useState('11:00 AM');
  const [callTopic, setCallTopic] = useState('Knee flexion evaluation');
  const [callSuccessMsg, setCallSuccessMsg] = useState('');

  // Profile Picture State
  const [profilePic, setProfilePic] = useState(currentUser?.avatar || "");

  // Guaranteed active log for AI Endpoint Analysis
  const activeLog = workoutLogs[0] || {
    sessionId: "SESS-9921",
    timestamp: new Date().toISOString(),
    athleteId: currentUser?.id || "ATH-202",
    athleteName: currentUser?.name || "Alex Morgan",
    videoProofUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    painScore: 2,
    fatigueLevel: 3,
    hasRecovered: true,
    readinessStatus: "fit_to_play",
    readinessBadgeText: "Fit to Play",
    readinessBadgeColor: "#ff5500",
    metrics: {
      movementSymmetryPercent: 88,
      adherenceRatePercent: 100,
      valgusAngleDeviation: 3.2,
      romDegrees: 115,
      overallQualityScore: 89
    },
    aiReport: {
      summary: "Athlete demonstrates high kinetic symmetry (88%) with minimal valgus deviation (3.2°). Prescribed exercise sets executed with 100% adherence.",
      biomechanicalFeedback: "Video AI analyzed 3 prescribed movements. Form error rate: 1.2%.",
      nextSteps: "Continue prescribed loading phase under Dr. Valli direction."
    }
  };

  // Seamless Gemini AI Insights Fetching
  const handleFetchAiInsights = async () => {
    setIsLoadingAi(true);
    const result = await getGeminiAIInsights({
      athleteName: currentUser?.name || "Alex Morgan",
      injuryCondition: currentUser?.conditionName || "ACL Reconstruction",
      romDegrees: activeLog?.metrics?.romDegrees || 115,
      painScore: activeLog?.painScore || painScore,
      valgusWobble: activeLog?.metrics?.valgusAngleDeviation || 3.2,
      symmetryPercent: activeLog?.metrics?.movementSymmetryPercent || 88,
      currentPhase: orthoClearance?.currentPhase || "Phase 2"
    });
    setAiInsights(result);
    setIsLoadingAi(false);
  };

  useEffect(() => {
    handleFetchAiInsights();
  }, [workoutLogs]);

  // Handle Video Recording Simulation
  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    }, 3500);
  };

  // Submit Workout Log (Requires ALL Prescribed Exercises to be Recorded First)
  const handleWorkoutSubmit = (e) => {
    e.preventDefault();
    if (!isAllExercisesRecorded) {
      alert(`⚠️ Video proof for ALL ${totalPrescribedCount} prescribed exercises is required!\n\nCurrently Recorded: ${recordedCount}/${totalPrescribedCount}. Please record or upload video proof for all exercises before pushing to Doctor.`);
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      const allVideos = Object.values(recordedExerciseProofs).map(p => `${p.exerciseName}: ${p.recordedVideoUrl}`).join(' | ');
      const firstVideo = Object.values(recordedExerciseProofs)[0]?.recordedVideoUrl || recordedVideoUrl;

      const evaluation = processWorkoutEndEndpoint({
        athleteId: currentUser?.id || "ATH-202",
        athleteName: currentUser?.name || "Alex Morgan",
        doctorId: "DOC-101",
        doctorName: currentUser?.assignedDoctorName || "Dr. Valli",
        injuryId: currentUser?.conditionId || "KNEE_001",
        completedExercises,
        videoProofUrl: firstVideo,
        painScore: Number(painScore),
        fatigueLevel: Number(fatigueLevel),
        notes: athleteNotes || `Recorded all ${totalPrescribedCount} exercise videos. Proofs: ${allVideos}`
      });

      addWorkoutLog(evaluation);
      setIsSubmitting(false);
      setAthleteNotes('');
      alert(`✓ All ${totalPrescribedCount} Prescribed Exercise Videos & Telemetry submitted successfully!\n\nAI analysis ready and synced directly to Doctor & Physio Dashboard.`);
      setActiveTab('endpoint_analysis');
    }, 1200);
  };

  // Submit Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    sendMessage(newMessageText, 'athlete', currentUser?.name || 'Alex Morgan');
    setNewMessageText('');
  };

  // Request Call
  const handleRequestCallSubmit = (e) => {
    e.preventDefault();
    requestCall(callDate, callTime, callTopic, currentUser?.name || 'Alex Morgan');
    setCallSuccessMsg("Call request submitted! Waiting for Physio/Ortho approval.");
    setTimeout(() => setCallSuccessMsg(''), 4000);
  };

  // Sidebar Items Definition
  const sidebarNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Your Workout Plan', icon: Activity },
    { id: 'progress', label: 'Your Progress', icon: TrendingUp },
    { id: 'ai_insights', label: 'Personalised AI Insights', icon: Sparkles },
    { id: 'messages', label: 'Talk with your Physio', icon: MessageSquare },
    { id: 'endpoint_analysis', label: 'AI Endpoint Analysis', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const athleteBottomNavItems = [
    { id: 'home', shortLabel: 'Home', icon: Home },
    { id: 'workout', shortLabel: 'Workout', icon: Activity },
    { id: 'progress', shortLabel: 'Progress', icon: TrendingUp },
    { id: 'ai_insights', shortLabel: 'AI', icon: Sparkles },
    { id: 'messages', shortLabel: 'Chat', icon: MessageSquare }
  ];

  return (
    <div className="strava-dashboard-grid animate-fade-in">
      {/* LEFT SIDEBAR WIDGET */}
      <aside className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* HIGH-IMPACT TOP NAVIGATION CARD (PLACED ABOVE PROFILE/STATS AS REQUESTED) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)'
          }}
        >
          <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(252, 76, 2, 0.12) 0%, rgba(252, 76, 2, 0.22) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={18} color="#fc4c02" />
              </div>
              <span className="text-xs font-extrabold text-main uppercase tracking-wider">
                NAVIGATION
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                background: '#fff7ed',
                color: '#fc4c02',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                border: '1px solid #fed7aa'
              }}
            >
              7 TABS
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              let badge = null;
              if (item.id === 'ai_insights') badge = { text: 'AI', bg: '#3b82f6', color: '#ffffff' };
              else if (item.id === 'messages') badge = { text: 'LIVE', bg: '#22c55e', color: '#ffffff' };
              else if (item.id === 'endpoint_analysis') badge = { text: '3D', bg: '#8b5cf6', color: '#ffffff' };
              else if (item.id === 'workout') badge = { text: 'PLAN', bg: '#fc4c02', color: '#ffffff' };

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '12px',
                    border: isActive ? '1px solid #fc4c02' : '1px solid #e2e8f0',
                    background: isActive ? 'linear-gradient(135deg, #fc4c02 0%, #ff7034 100%)' : '#ffffff',
                    color: isActive ? '#ffffff' : '#1e293b',
                    boxShadow: isActive
                      ? '0 6px 18px rgba(252, 76, 2, 0.32)'
                      : '0 2px 5px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(-2px) translateX(4px)';
                      e.currentTarget.style.borderColor = '#fc4c02';
                      e.currentTarget.style.color = '#fc4c02';
                      e.currentTarget.style.background = '#fff7ed';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(0) translateX(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#1e293b';
                      e.currentTarget.style.background = '#ffffff';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <IconComp size={16} color={isActive ? '#ffffff' : '#fc4c02'} />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {badge ? (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 900,
                        background: isActive ? '#ffffff' : badge.bg,
                        color: isActive ? '#fc4c02' : badge.color,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {badge.text}
                    </span>
                  ) : (
                    <ChevronRight size={14} color={isActive ? '#ffffff' : '#cbd5e1'} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Header & This Week Stats Widget */}
        <div className="strava-card">
          {/* User Header */}
          <div className="flex items-center gap-3 mb-4">
            <AvatarPlaceholder src={currentUser?.avatar} name={currentUser?.name || 'Alex Morgan'} size={44} />
            <div>
              <h4 className="text-sm font-bold text-dark">{currentUser?.name || 'Alex Morgan'}</h4>
              <span className="text-xs text-strava font-semibold">ACL Reconstruction • Wk 6</span>
            </div>
          </div>

          {/* THIS WEEK STATS */}
          <div className="mb-4">
            <span className="text-xs font-bold text-muted uppercase" style={{ letterSpacing: '0.04em' }}>
              THIS WEEK
            </span>
            <div className="text-2xl font-extrabold text-dark mt-1">4 Sessions</div>

            {/* Day Bar Chart M T W T F S S */}
            <div className="strava-day-tracker">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="strava-day-col">
                  <div className="strava-day-bar">
                    <div
                      className="strava-day-bar-fill"
                      style={{ height: idx === 1 || idx === 3 || idx === 4 ? '100%' : idx === 2 ? '50%' : '0%' }}
                    ></div>
                  </div>
                  <span className="strava-day-label">{day}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-muted font-semibold mt-1">
              <span>0h 45m</span>
              <span>115° ROM</span>
            </div>
          </div>

          {/* THIS YEAR LINE */}
          <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-xs font-bold text-muted uppercase">THIS YEAR</span>
            <div style={{ height: '2px', background: '#e6e6ec', margin: '0.5rem 0', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '20%', top: '-4px', width: '2px', height: '10px', background: 'var(--text-dark)' }}></div>
            </div>
            <div className="text-xs text-muted font-bold text-right" style={{ fontSize: '0.65rem' }}>TODAY</div>
          </div>

          {/* BOTTOM LINK */}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-bold text-dark flex items-center justify-between w-full"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span>Manage Your Goals</span>
              <span>›</span>
            </button>
          </div>
        </div>
      </aside>

      {/* CENTER MAIN FEED AREA */}
      <main className="flex flex-col gap-4" style={{ minWidth: 0 }}>
        {/* TOP QUICK NAVIGATION TABS BAR (HORIZONTAL OVERVIEW FOR QUICK TAB SWITCHING) */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '0.5rem 0.75rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}
        >
          {sidebarNavItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '999px',
                  border: isActive ? '1px solid #fc4c02' : '1px solid #e2e8f0',
                  background: isActive ? 'linear-gradient(135deg, #fc4c02 0%, #ff7034 100%)' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <IconComp size={15} color={isActive ? '#ffffff' : '#fc4c02'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {/* STRAVA ONBOARDING ACTION FEED ITEM LIST (TEMPLATE IMAGE 4) */}
        {activeTab === 'home' && (
          <>
            <div className="strava-feed-card">
              <div className="strava-action-item">
                <div className="strava-action-icon-box">
                  <Video size={20} color="var(--text-dark)" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-dark mb-1">Record your first activity</h4>
                  <p className="text-xs text-muted mb-3">
                    Set up your 3D pose camera or upload your workout video proof to track joint angle & motion symmetry.
                  </p>
                  <button onClick={() => setActiveTab('workout')} className="btn-strava">
                    Activate Camera
                  </button>
                </div>
              </div>

              <div className="strava-action-item">
                <div className="strava-action-icon-box">
                  <Activity size={20} color="var(--text-dark)" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-dark mb-1">See what your physio is prescribing</h4>
                  <p className="text-xs text-muted mb-3">
                    Find prescribed exercises from Dr. Sarah Jenkins or review targeted ACL reconstruction protocols.
                  </p>
                  <button onClick={() => setActiveTab('workout')} className="btn-strava">
                    View Treatment Plan
                  </button>
                </div>
              </div>

              <div className="strava-action-item">
                <div className="strava-action-icon-box">
                  <ShieldCheck size={20} color="var(--text-dark)" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-dark mb-1">Choose your clearance & privacy settings</h4>
                  <p className="text-xs text-muted mb-3">
                    Learn more about Rehab360 AI privacy controls and customize doctor access to your video proof.
                  </p>
                  <button onClick={() => setActiveTab('profile')} className="btn-strava">
                    Privacy Settings
                  </button>
                </div>
              </div>
            </div>

            {/* STRAVA RECENT ACTIVITY POST FEED */}
            <div className="strava-feed-card">
              <div className="strava-feed-header justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder src={currentUser?.avatar} name={currentUser?.name || "Alex Morgan"} size={40} />
                  <div>
                    <h4 className="text-sm font-bold text-dark">{currentUser?.name || "Alex Morgan"}</h4>
                    <span className="text-xs text-muted">Today at 10:45 AM • Knee Flexion Protocol</span>
                  </div>
                </div>
                <span className="strava-feed-badge">Fit to Play</span>
              </div>

              <h3 className="text-lg font-bold text-dark mb-2">Phase 2 Loading Session — 115° Knee Flexion</h3>
              <p className="text-xs text-muted mb-4">
                Completed 3 sets of Bodyweight Squats with zero valgus wobble (3.2° deviation). Movement symmetry calculated at 88%.
              </p>
            </div>

            {/* Performance Graph Component */}
            <DailyPerformanceGraph />

            {/* Prescribed Plan Banner & Overview */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <Activity size={20} color="var(--primary)" /> Today's Doctor Prescription
                </h3>
                <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                  {workoutPlan?.exercises?.length || 3} Exercises Assigned
                </span>
              </div>
              <p className="text-sm text-muted mb-4">{workoutPlan?.weeklyGoal}</p>

              <div className="flex flex-col gap-3">
                {workoutPlan?.exercises?.map((ex, index) => (
                  <div
                    key={ex.id || index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5"
                    style={{
                      background: '#fafafa',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #f1f5f9',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="text-sm font-bold text-main">{ex.name}</h4>
                      <span className="text-xs text-muted block mt-0.5">
                        Sets: <strong>{ex.sets}</strong> | Reps: <strong>{ex.reps}</strong> | Load: <strong>{ex.load}</strong> | Tempo: <strong>{ex.tempo}</strong>
                      </span>
                    </div>

                    {ex.notes && (
                      <div
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--border-accent)',
                          maxWidth: '100%',
                          wordBreak: 'break-word',
                          flexShrink: 0
                        }}
                      >
                        <span className="text-xs font-bold text-primary block">
                          💡 {ex.notes}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. YOUR WORKOUT PLAN TAB */}
        {activeTab === 'workout' && (
          <div className="flex flex-col gap-6">
            {/* SEQUENTIAL MULTI-EXERCISE QUEUE STEPPER HEADER */}
            <div className="glass-card" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-extrabold text-primary uppercase" style={{ letterSpacing: '0.05em' }}>
                    PRESCRIBED WORKOUT SEQUENTIAL RECORDING QUEUE
                  </span>
                  <h3 className="text-base font-bold text-main">
                    Exercise {activeExerciseIndex + 1} of {totalPrescribedCount}: {prescribedExercises[activeExerciseIndex]?.name}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    background: isAllExercisesRecorded ? '#dcfce7' : '#fff7ed',
                    color: isAllExercisesRecorded ? '#15803d' : '#fc4c02',
                    border: isAllExercisesRecorded ? '1px solid #86efac' : '1px solid #fed7aa'
                  }}
                >
                  {recordedCount} / {totalPrescribedCount} EXERCISE VIDEOS LOGGED
                </span>
              </div>

              {/* Stepper pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {prescribedExercises.map((ex, idx) => {
                  const isRecorded = !!recordedExerciseProofs[ex.id];
                  const isActive = idx === activeExerciseIndex;
                  const isLocked = !isRecorded && idx > activeExerciseIndex && !recordedExerciseProofs[prescribedExercises[idx - 1]?.id];

                  return (
                    <button
                      key={ex.id || idx}
                      disabled={isLocked}
                      onClick={() => setActiveExerciseIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: isActive ? '1px solid #fc4c02' : isRecorded ? '1px solid #22c55e' : '1px solid #cbd5e1',
                        background: isActive ? '#fff7ed' : isRecorded ? '#f0fdf4' : isLocked ? '#f8fafc' : '#ffffff',
                        color: isActive ? '#fc4c02' : isRecorded ? '#15803d' : isLocked ? '#94a3b8' : '#0f172a',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.6 : 1,
                        flexShrink: 0
                      }}
                    >
                      {isRecorded ? (
                        <CheckCircle2 size={15} color="#22c55e" />
                      ) : isLocked ? (
                        <span style={{ fontSize: '0.85rem' }}>🔒</span>
                      ) : (
                        <span style={{ fontSize: '0.85rem' }}>📹</span>
                      )}
                      <span>Ex {idx + 1}: {ex.name}</span>
                      {isRecorded && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#22c55e', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Saved ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-Time Google MediaPipe 3D Vision & Vector Trigonometry Engine */}
            <MediaPipePoseTracker
              activeExerciseId={prescribedExercises[activeExerciseIndex]?.id || 'squat'}
              activeExerciseName={prescribedExercises[activeExerciseIndex]?.name || 'Bodyweight Squat'}
              exerciseIndex={activeExerciseIndex}
              totalExercises={totalPrescribedCount}
              onSaveExerciseSession={handleSaveExerciseSession}
              onCompleteSession={handleSaveExerciseSession}
            />

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 className="text-xl font-bold text-main mb-2">Prescribed Workout Execution & Doctor Submission</h2>
              <p className="text-sm text-muted mb-6">
                Record or upload video proof for all {totalPrescribedCount} prescribed exercises below. Submission to doctor is unlocked only when all exercise videos are recorded.
              </p>

              {/* Workout Logging Form */}
              <form onSubmit={handleWorkoutSubmit} className="flex flex-col gap-5">
                <div>
                  <h4 className="text-sm font-bold text-main mb-3">Prescribed Exercise Video Status Checklist</h4>
                  <div className="flex flex-col gap-2">
                    {prescribedExercises.map((ex, index) => {
                      const isRecorded = !!recordedExerciseProofs[ex.id];
                      return (
                        <div
                          key={ex.id || index}
                          className="flex items-center justify-between p-3.5"
                          style={{
                            background: isRecorded ? '#f0fdf4' : '#fafafa',
                            borderRadius: 'var(--radius-md)',
                            border: isRecorded ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              readOnly
                              checked={isRecorded}
                              style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                            />
                            <div>
                              <span className="text-sm font-bold text-main block">{ex.name} ({ex.sets} sets × {ex.reps} reps)</span>
                              <span className="text-xs text-muted">Target: {ex.load} • Tempo: {ex.tempo}</span>
                            </div>
                          </div>
                          {isRecorded ? (
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-300">
                              Video Recorded ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveExerciseIndex(index)}
                              className="btn-outline text-xs"
                              style={{ padding: '0.35rem 0.75rem' }}
                            >
                              {index === activeExerciseIndex ? "Recording Now..." : "Select to Record"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-main mb-1 block">Subjective Pain Score (0 - 10)</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={painScore}
                      onChange={(e) => setPainScore(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                    />
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>0 (Pain Free)</span>
                      <span className="font-bold text-primary">{painScore} / 10</span>
                      <span>10 (Severe Pain)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-main mb-1 block">Fatigue Level (1 - 10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fatigueLevel}
                      onChange={(e) => setFatigueLevel(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                    />
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>1 (Fresh)</span>
                      <span className="font-bold text-primary">{fatigueLevel} / 10</span>
                      <span>10 (Exhausted)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-main mb-1 block">Session Notes / Observations for Doctor</label>
                  <textarea
                    rows={2}
                    value={athleteNotes}
                    onChange={(e) => setAthleteNotes(e.target.value)}
                    placeholder="Log how your joint felt across all prescribed exercises..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isAllExercisesRecorded}
                  className="btn-primary"
                  style={{
                    padding: '0.9rem',
                    fontSize: '0.95rem',
                    background: isAllExercisesRecorded
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : '#cbd5e1',
                    color: isAllExercisesRecorded ? '#ffffff' : '#64748b',
                    cursor: isAllExercisesRecorded ? 'pointer' : 'not-allowed',
                    border: 'none',
                    boxShadow: isAllExercisesRecorded ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
                  }}
                >
                  {isSubmitting
                    ? "Processing AI Video Endpoint & Submitting..."
                    : isAllExercisesRecorded
                    ? `✓ Push All ${totalPrescribedCount} Exercise Videos & Telemetry to Doctor →`
                    : `🔒 Push Disabled — Record Videos for All ${totalPrescribedCount} Exercises (${recordedCount}/${totalPrescribedCount} Done)`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. YOUR PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="flex flex-col gap-6">
            <DailyPerformanceGraph />

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 className="text-xl font-bold text-main mb-2">Micro-Progression Analytics</h2>
              <p className="text-sm text-muted mb-6">Tracking daily Range of Motion (ROM), pain trends, and kinetic symmetry</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs text-muted">Active ROM Flexion</span>
                  <span className="text-2xl font-bold text-main">118° <span className="text-xs text-primary font-bold">+5° this week</span></span>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem' }}>
                    <div style={{ width: '80%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs text-muted">Avg Pain Score</span>
                  <span className="text-2xl font-bold text-main">1.8 / 10 <span className="text-xs text-primary font-bold">Decreasing</span></span>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem' }}>
                    <div style={{ width: '20%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs text-muted">Kinetic Symmetry</span>
                  <span className="text-2xl font-bold text-main">89% <span className="text-xs text-primary font-bold">Optimal</span></span>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem' }}>
                    <div style={{ width: '89%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              {/* Log History */}
              <h3 className="text-base font-bold text-main mb-3">Completed Workout History</h3>
              <div className="flex flex-col gap-3">
                {workoutLogs.map((log, index) => (
                  <div key={log.sessionId || index} className="p-4" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-main">{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800 }}>
                        {log.readinessBadgeText}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted">
                      <span>Symmetry: <strong>{log.metrics.movementSymmetryPercent}%</strong></span>
                      <span>Pain: <strong>{log.painScore}/10</strong></span>
                      <span>Valgus: <strong>{log.metrics.valgusAngleDeviation}°</strong></span>
                      <span>Adherence: <strong>{log.metrics.adherenceRatePercent}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. PERSONALISED AI INSIGHTS TAB */}
        {activeTab === 'ai_insights' && (
          <div className="flex flex-col gap-6">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-main flex items-center gap-2">
                    <Sparkles size={22} color="var(--primary)" /> Gemini AI Personalised Recommendations
                  </h2>
                  <p className="text-xs text-muted">Real-time recovery analysis generated directly via Google Gemini API</p>
                </div>
                <button onClick={handleFetchAiInsights} disabled={isLoadingAi} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} className={isLoadingAi ? "animate-spin" : ""} /> {isLoadingAi ? "Analyzing..." : "Refresh Insights"}
                </button>
              </div>

              {/* AI Output Card */}
              {aiInsights ? (
                <div className="flex flex-col gap-4">
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-accent)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-extrabold text-primary" style={{ letterSpacing: '0.05em' }}>CLINICAL AI ENGINE: {aiInsights.source}</span>
                      <span className="text-sm font-bold text-main">Recovery Index: {aiInsights.recoveryScore}/100</span>
                    </div>
                    <h3 className="text-base font-bold text-main mb-2">Biomechanical Assessment</h3>
                    <p className="text-sm text-muted mb-4" style={{ lineHeight: 1.6 }}>{aiInsights.assessment}</p>

                    <h4 className="text-sm font-bold text-main mb-1">Recommended Weekly Focus</h4>
                    <p className="text-sm text-muted mb-4" style={{ lineHeight: 1.6 }}>{aiInsights.weeklyFocus}</p>

                    <h4 className="text-sm font-bold text-main mb-1">Caution / Safety Alert</h4>
                    <p className="text-sm text-primary font-semibold" style={{ lineHeight: 1.6 }}>{aiInsights.caution}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted">Connecting to Gemini AI Engine...</div>
              )}
            </div>
          </div>
        )}

        {/* 5. TALK WITH YOUR PHYSIO TAB */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Direct WhatsApp-Style Chat Engine (2 cols) */}
            <div className="lg:col-span-2">
              <WhatsAppChat
                currentUser={currentUser}
                recipient={{
                  name: currentUser?.assignedPhysioName || "Dr. Sarah Jenkins, PT",
                  role: "Lead Physiotherapist",
                  status: "Online • Active Now",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJenkins&backgroundColor=b6e3f4"
                }}
                messages={messages}
                onSendMessage={(text) => sendMessage(text, 'athlete', currentUser?.name || 'Alex Morgan')}
                onRequestCall={() => setActiveTab('messages')}
              />
            </div>

            {/* Schedule a Call Request (1 col) */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="text-lg font-bold text-main mb-1">Schedule a Call</h3>
              <p className="text-xs text-muted mb-4">Call requests are subject to approval by assigned Doctor/Physio</p>

              {callSuccessMsg && (
                <div className="p-3 mb-3 text-xs font-bold text-primary bg-orange-50 rounded-md border border-orange-200">
                  {callSuccessMsg}
                </div>
              )}

              <form onSubmit={handleRequestCallSubmit} className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-main mb-1 block">Preferred Date</label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-main mb-1 block">Preferred Time Slot</label>
                  <input
                    type="text"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    placeholder="10:30 AM"
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-main mb-1 block">Reason / Topic</label>
                  <input
                    type="text"
                    value={callTopic}
                    onChange={(e) => setCallTopic(e.target.value)}
                    placeholder="Progress evaluation"
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                  <Phone size={16} /> Request Video Call Appointment
                </button>
              </form>

              {/* Call Requests Status List */}
              <h4 className="text-xs font-bold text-main mb-2">Call Request Status</h4>
              <div className="flex flex-col gap-2">
                {callRequests.map((c) => (
                  <div key={c.id} className="p-3" style={{ background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-main">{c.topic} ({c.requestedDate} @ {c.requestedTime})</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          background: c.status === 'approved' ? 'var(--primary-light)' : '#fef3c7',
                          color: c.status === 'approved' ? 'var(--primary)' : '#b45309'
                        }}
                      >
                        {c.status === 'approved' ? `Approved by ${c.approvedBy || 'Doctor'}` : 'Pending Approval'}
                      </span>
                    </div>
                    {c.status === 'approved' && c.meetingLink && (
                      <a href={c.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold block mt-1">
                        Join Meeting Link →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. AI ENDPOINT ANALYSIS TAB */}
        {activeTab === 'endpoint_analysis' && (
          <div className="flex flex-col gap-6">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 className="text-xl font-bold text-main mb-1">AI Endpoint Analysis</h2>
              <p className="text-xs text-muted mb-6">Computer Vision MediaPipe Pose Analysis & Return-to-Play Verdicts</p>

              <div className="flex flex-col gap-6">
                {/* Verdict Badge Box */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '2px solid var(--primary)',
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                  }}
                >
                  <span className="text-xs font-extrabold text-primary block mb-1" style={{ letterSpacing: '0.05em' }}>OFFICIAL AI READINESS VERDICT</span>
                  <h2 className="text-3xl font-extrabold mb-3 text-primary">
                    {activeLog.readinessBadgeText}
                  </h2>
                  <p className="text-sm text-muted" style={{ maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
                    {activeLog.aiReport?.summary || "Athlete demonstrates high kinetic symmetry with minimal joint deviation. Cleared for prescribed movement loading."}
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="text-xs text-muted">Kinetic Symmetry Index</span>
                    <span className="text-2xl font-bold text-main">{activeLog.metrics?.movementSymmetryPercent || 88}%</span>
                    <span className="text-xs text-muted">Bilateral loading balance</span>
                  </div>

                  <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="text-xs text-muted">Medial Knee Valgus Wobble</span>
                    <span className="text-2xl font-bold text-main">{activeLog.metrics?.valgusAngleDeviation || 3.2}°</span>
                    <span className="text-xs text-muted">Inward joint deviation</span>
                  </div>

                  <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="text-xs text-muted">Prescription Compliance</span>
                    <span className="text-2xl font-bold text-main">{activeLog.metrics?.adherenceRatePercent || 100}%</span>
                    <span className="text-xs text-muted">Completed exercise sets</span>
                  </div>
                </div>

                {/* Video Proof Link & Next Steps */}
                <div className="p-4" style={{ background: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
                  <h4 className="text-sm font-bold text-main mb-1">Clinical Recommendation & Next Steps</h4>
                  <p className="text-xs text-muted mb-2">{activeLog.aiReport?.nextSteps || "Continue prescribed loading phase under assigned physician direction."}</p>
                  {activeLog.videoProofUrl && (
                    <a href={activeLog.videoProofUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary block">
                      ▶ View Verified Workout Video Proof Recording →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 className="text-xl font-bold text-main mb-2">Athlete Profile Settings</h2>
              <p className="text-sm text-muted mb-6">Manage personal information, medical status, and profile picture attachment</p>

              {/* Profile Avatar Selection Section */}
              <div className="mb-6">
                <ProfileAvatarSelector
                  currentAvatar={currentUser?.avatar}
                  userName={currentUser?.name || "Alex Morgan"}
                  role="athlete"
                  onUpdateAvatar={(newAvatar) => updateUserProfile({ avatar: newAvatar }, 'athlete')}
                />
              </div>

              {/* Clinical Metadata */}
              <h3 className="text-base font-bold text-main mb-4">Medical & Rehabilitation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs font-bold text-muted">Medical Diagnosis</span>
                  <span className="text-sm font-bold text-main">{currentUser?.conditionName || "ACL Reconstruction"}</span>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs font-bold text-muted">Assigned Orthopedic Surgeon</span>
                  <span className="text-sm font-bold text-main">{currentUser?.assignedDoctorName || "Dr. Valli"}</span>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs font-bold text-muted">Assigned Physiotherapist</span>
                  <span className="text-sm font-bold text-main">{currentUser?.assignedPhysioName || "Dr. Sarah Jenkins, PT"}</span>
                </div>

                <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="text-xs font-bold text-muted">Active Rehab Phase</span>
                  <span className="text-sm font-bold text-main">{orthoClearance?.currentPhase}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <AppBottomNav
        items={athleteBottomNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default AthleteDashboard;
