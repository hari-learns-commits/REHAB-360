import React, { createContext, useContext, useState, useEffect } from 'react';

const RehabDataContext = createContext(null);

// Default initial state for synchronization
const INITIAL_DATA = {
  // Shared Prescribed Plans
  workoutPlan: {
    id: "PLAN-101",
    phaseName: "Phase 2: Neuromuscular Control & ROM",
    phaseNumber: 2,
    totalPhases: 4,
    assignedBy: "Dr. Valli (Orthopedic Surgeon) & Dr. Sarah Jenkins, PT",
    weeklyGoal: "Focus on knee stability & active extension (0-120°)",
    exercises: [
      { id: "ex-1", name: "Single-Leg Balance Squats", sets: 3, reps: 10, tempo: "3-1-1", load: "Bodyweight", notes: "Keep knee tracking over 2nd toe" },
      { id: "ex-2", name: "Seated Terminal Knee Extensions", sets: 3, reps: 15, tempo: "2-2-1", load: "2 kg ankle weight", notes: "Hold full extension for 2s" },
      { id: "ex-3", name: "Glute Bridge with Resistance Band", sets: 4, reps: 12, tempo: "2-1-2", load: "Medium Band", notes: "Squeeze glutes at top" }
    ]
  },

  // Athlete Completed Workout Logs
  workoutLogs: [
    {
      sessionId: "SESS-9921",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      athleteId: "ATH-202",
      athleteName: "Alex Morgan",
      videoProofUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      recordedExerciseProofs: {
        "squat": {
          exerciseId: "squat",
          exerciseName: "Bodyweight Squat",
          status: "recorded",
          recordedVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          romDegrees: 115,
          symmetryPercent: 94,
          valgusAngle: 2.1,
          repsCompleted: 10,
          formScore: 92
        },
        "bicep_curl": {
          exerciseId: "bicep_curl",
          exerciseName: "Bicep Curl",
          status: "recorded",
          recordedVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          romDegrees: 120,
          symmetryPercent: 96,
          valgusAngle: 1.8,
          repsCompleted: 12,
          formScore: 95
        },
        "overhead_press": {
          exerciseId: "overhead_press",
          exerciseName: "Overhead Shoulder Press",
          status: "recorded",
          recordedVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          romDegrees: 108,
          symmetryPercent: 92,
          valgusAngle: 2.5,
          repsCompleted: 10,
          formScore: 90
        }
      },
      painScore: 2,
      fatigueLevel: 3,
      hasRecovered: true,
      readinessStatus: "fit_to_play",
      readinessBadgeText: "Fit to Play",
      readinessBadgeColor: "#3b82f6",
      metrics: {
        movementSymmetryPercent: 88,
        adherenceRatePercent: 100,
        valgusAngleDeviation: 3.2,
        romDegrees: 115,
        overallQualityScore: 89
      },
      physioComment: "Good heel plant! Try to slow down the eccentric phase slightly.",
      telemetryData: [
        { timestamp: 0, exercise_phase: 'standing', primary_angle: 170, left_angle: 170, right_angle: 170, valgus_deviation: 1.2, symmetry: 98, safety_status: 'safe', compensatory_flags: [] },
        { timestamp: 1000, exercise_phase: 'eccentric', primary_angle: 145, left_angle: 145, right_angle: 147, valgus_deviation: 1.8, symmetry: 96, safety_status: 'safe', compensatory_flags: [] },
        { timestamp: 2000, exercise_phase: 'eccentric', primary_angle: 120, left_angle: 120, right_angle: 122, valgus_deviation: 2.8, symmetry: 94, safety_status: 'safe', compensatory_flags: [] },
        { timestamp: 3000, exercise_phase: 'isometric', primary_angle: 110, left_angle: 110, right_angle: 112, valgus_deviation: 3.5, symmetry: 92, safety_status: 'unsafe', compensatory_flags: ['knee_valgus'] },
        { timestamp: 4000, exercise_phase: 'concentric', primary_angle: 135, left_angle: 135, right_angle: 142, valgus_deviation: 2.1, symmetry: 88, safety_status: 'caution', compensatory_flags: ['asymmetrical_loading'] },
        { timestamp: 5000, exercise_phase: 'standing', primary_angle: 168, left_angle: 168, right_angle: 170, valgus_deviation: 1.1, symmetry: 97, safety_status: 'safe', compensatory_flags: [] }
      ]
    }
  ],

  // Physio Form Correction Video Messages (linked to workouts)
  videoAnnotations: [
    {
      id: "ann-1",
      sessionId: "SESS-9921",
      timestamp: "00:04",
      exerciseName: "Single-Leg Balance Squats",
      note: "Shift your weight further back on your heels during the drop phase!",
      author: "Dr. Sarah Jenkins, PT",
      createdAt: new Date(Date.now() - 40000000).toISOString()
    }
  ],

  // Direct Communication / Messages
  messages: [
    { id: "m-1", sender: "physio", senderName: "Dr. Sarah Jenkins, PT", text: "Hey Alex! Watched yesterday's squat video proof. Great knee tracking!", time: " Yesterday 4:30 PM" },
    { id: "m-2", sender: "athlete", senderName: "Alex Morgan", text: "Thanks! Felt a tiny bit of tightness at 110° flexion.", time: " Yesterday 5:00 PM" }
  ],

  // Call Requests
  callRequests: [
    {
      id: "call-1",
      athleteName: "Alex Morgan",
      requestedDate: "2026-10-06",
      requestedTime: "10:30 AM",
      topic: "Post-op Week 6 Progress Check",
      status: "approved", // 'pending', 'approved', 'declined'
      approvedBy: "Dr. Valli",
      meetingLink: "https://meet.rehab360.ai/room-ath202"
    }
  ],

  // Orthopedic Clearances & Phase Approval Status
  orthoClearance: {
    postOpWeek: "Week 6 Post-Op",
    currentPhase: "Phase 2: Neuromuscular Control",
    clearanceStatus: "Cleared for Weight-Bearing & Light Jogging", // Options: 'Rest Restricted', 'Cleared for Weight-Bearing', 'Cleared for Jogging', 'Cleared for Contact'
    medicalConstraints: [
      "Do not exceed 120° knee flexion for the next 10 days",
      "Avoid impact jumping on hard surfaces"
    ],
    lastUpdated: new Date().toISOString()
  },

  // Phase Progression Requests (Physio -> Ortho)
  phaseProgressionRequests: [
    {
      id: "prog-1",
      athleteName: "Alex Morgan",
      currentPhase: "Phase 2",
      targetPhase: "Phase 3: Dynamic Plyometrics & Agility",
      submittedBy: "Dr. Sarah Jenkins, PT",
      romAchieved: "120°",
      painAvg: "1.8 / 10",
      status: "pending_review", // 'pending_review', 'approved', 'rejected'
      submittedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],

  // Red Flag Alerts (Automated & Manual)
  redFlagAlerts: [
    {
      id: "rf-1",
      athleteName: "Nidheesh S",
      type: "Pain Spike Alert",
      severity: "high",
      details: "Logged pain score of 8/10 during hamstring curls",
      timestamp: new Date(Date.now() - 12000000).toISOString(),
      status: "unresolved"
    }
  ],

  // Diagnostic Vault (X-Rays, MRIs, Operative Notes)
  diagnosticVault: [
    {
      id: "diag-1",
      title: "Post-Op MRI Scan - Left Knee",
      date: "2026-09-15",
      type: "MRI Imaging",
      fileUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
      notes: "ACL autograft intact. Intact joint space with zero meniscal tear residual."
    },
    {
      id: "diag-2",
      title: "Surgical Operative Report",
      date: "2026-08-20",
      type: "Operative Report",
      fileUrl: "",
      notes: "Successful Arthroscopic ACL Reconstruction using patellar tendon autograft."
    }
  ],

  // Clinical Follow-up Notes (Ortho & Physio)
  clinicalNotes: [
    {
      id: "note-1",
      doctorName: "Dr. Valli",
      date: "2026-09-28",
      note: "Patient demonstrates good graft stability on Lachman test. Quad tone improving. Approved for Phase 2 progression."
    }
  ],

  // Unified Chronological Timeline
  timeline: [
    { id: "t-1", date: "2026-08-20", title: "ACL Reconstruction Surgery", type: "ortho", icon: "Stethoscope", description: "Dr. Valli performed Arthroscopic ACL reconstruction." },
    { id: "t-2", date: "2026-09-15", title: "Post-Op MRI Imaging", type: "diagnostic", icon: "FileText", description: "Diagnostic scan verified graft integration." },
    { id: "t-3", date: "2026-09-28", title: "Ortho Clearance Granted", type: "ortho", icon: "CheckCircle", description: "Dr. Valli cleared patient for Weight-Bearing exercises." },
    { id: "t-4", date: "2026-10-04", title: "Physio Program Updated", type: "physio", icon: "Activity", description: "Dr. Sarah Jenkins, PT assigned Single-Leg Balance Squats routine." }
  ]
};

export const RehabDataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('rehab360_shared_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load shared state:", e);
    }
    return INITIAL_DATA;
  });

  // Sync to localStorage and dispatch storage event for multi-tab sync
  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('rehab360_shared_state', JSON.stringify(next));
      } catch (e) {
        console.error("Storage save failed:", e);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key && e.key !== 'rehab360_shared_state') return;
      try {
        const saved = localStorage.getItem('rehab360_shared_state');
        if (saved) setData(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Action Helpers
  const addWorkoutLog = (newLog) => {
    updateData((prev) => {
      const updatedLogs = [newLog, ...prev.workoutLogs];
      const newTimelineItem = {
        id: `t-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        title: `Workout Logged (${newLog.readinessBadgeText})`,
        type: 'athlete',
        icon: 'Video',
        description: `Pain Score: ${newLog.painScore}/10 | Kinetic Symmetry: ${newLog.metrics.movementSymmetryPercent}%`
      };

      // Check if pain score triggers red flag
      let updatedRedFlags = [...prev.redFlagAlerts];
      if (newLog.painScore >= 7) {
        updatedRedFlags.unshift({
          id: `rf-${Date.now()}`,
          athleteName: newLog.athleteName,
          type: "High Pain Spike Alert",
          severity: "high",
          details: `Logged pain score of ${newLog.painScore}/10 during workout submission`,
          timestamp: new Date().toISOString(),
          status: "unresolved"
        });
      }

      return {
        ...prev,
        workoutLogs: updatedLogs,
        redFlagAlerts: updatedRedFlags,
        timeline: [newTimelineItem, ...prev.timeline]
      };
    });
  };

  const updateWorkoutPlan = (newPlan) => {
    updateData((prev) => ({
      ...prev,
      workoutPlan: newPlan,
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          title: "Workout Program Updated",
          type: 'physio',
          icon: 'Activity',
          description: `Physio updated routine with ${newPlan.exercises.length} prescribed exercises.`
        },
        ...prev.timeline
      ]
    }));
  };

  const sendMessage = (text, sender, senderName) => {
    updateData((prev) => {
      const msgId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: msgId,
            sender,
            senderName,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
    });
  };

  const requestCall = (date, time, topic, athleteName) => {
    updateData((prev) => ({
      ...prev,
      callRequests: [
        {
          id: `call-${Date.now()}`,
          athleteName: athleteName || "Alex Morgan",
          requestedDate: date,
          requestedTime: time,
          topic,
          status: "pending",
          approvedBy: null,
          meetingLink: ""
        },
        ...prev.callRequests
      ]
    }));
  };

  const updateCallStatus = (callId, status, doctorName) => {
    updateData((prev) => ({
      ...prev,
      callRequests: prev.callRequests.map((c) =>
        c.id === callId
          ? {
              ...c,
              status,
              approvedBy: doctorName,
              meetingLink: status === 'approved' ? `https://meet.rehab360.ai/room-${callId}` : ''
            }
          : c
      )
    }));
  };

  const addVideoAnnotation = (annotation) => {
    updateData((prev) => ({
      ...prev,
      videoAnnotations: [annotation, ...prev.videoAnnotations]
    }));
  };

  const requestPhaseProgression = (targetPhase, rom, painAvg, submittedBy) => {
    updateData((prev) => ({
      ...prev,
      phaseProgressionRequests: [
        {
          id: `prog-${Date.now()}`,
          athleteName: "Alex Morgan",
          currentPhase: prev.orthoClearance.currentPhase,
          targetPhase,
          submittedBy,
          romAchieved: rom,
          painAvg,
          status: "pending_review",
          submittedAt: new Date().toISOString()
        },
        ...prev.phaseProgressionRequests
      ]
    }));
  };

  const approvePhaseProgression = (requestId, constraints) => {
    updateData((prev) => {
      const req = prev.phaseProgressionRequests.find((r) => r.id === requestId);
      const updatedRequests = prev.phaseProgressionRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' } : r
      );
      return {
        ...prev,
        phaseProgressionRequests: updatedRequests,
        orthoClearance: {
          ...prev.orthoClearance,
          currentPhase: req ? req.targetPhase : prev.orthoClearance.currentPhase,
          medicalConstraints: constraints ? [...prev.orthoClearance.medicalConstraints, constraints] : prev.orthoClearance.medicalConstraints,
          lastUpdated: new Date().toISOString()
        },
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            title: `Phase Progression Approved (${req?.targetPhase || 'New Phase'})`,
            type: 'ortho',
            icon: 'CheckCircle',
            description: `Ortho approved phase movement with constraints: ${constraints || 'None'}`
          },
          ...prev.timeline
        ]
      };
    });
  };

  const updateClearanceStatus = (status, constraints) => {
    updateData((prev) => ({
      ...prev,
      orthoClearance: {
        ...prev.orthoClearance,
        clearanceStatus: status,
        medicalConstraints: constraints ? [...prev.orthoClearance.medicalConstraints, constraints] : prev.orthoClearance.medicalConstraints,
        lastUpdated: new Date().toISOString()
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          title: `Clearance Status Updated: ${status}`,
          type: 'ortho',
          icon: 'ShieldCheck',
          description: `Orthopedic Specialist set clearance status to: ${status}`
        },
        ...prev.timeline
      ]
    }));
  };

  const addClinicalNote = (doctorName, noteText) => {
    updateData((prev) => ({
      ...prev,
      clinicalNotes: [
        {
          id: `note-${Date.now()}`,
          doctorName,
          date: new Date().toLocaleDateString(),
          note: noteText
        },
        ...prev.clinicalNotes
      ]
    }));
  };

  const resolveRedFlag = (flagId) => {
    updateData((prev) => ({
      ...prev,
      redFlagAlerts: prev.redFlagAlerts.map((f) => (f.id === flagId ? { ...f, status: 'resolved' } : f))
    }));
  };

  return (
    <RehabDataContext.Provider
      value={{
        ...data,
        addWorkoutLog,
        updateWorkoutPlan,
        sendMessage,
        requestCall,
        updateCallStatus,
        addVideoAnnotation,
        requestPhaseProgression,
        approvePhaseProgression,
        updateClearanceStatus,
        addClinicalNote,
        resolveRedFlag
      }}
    >
      {children}
    </RehabDataContext.Provider>
  );
};

export const useRehabData = () => {
  const context = useContext(RehabDataContext);
  if (!context) {
    throw new Error("useRehabData must be used within a RehabDataProvider");
  }
  return context;
};
