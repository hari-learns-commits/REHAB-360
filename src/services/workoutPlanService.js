// Doctor-Directed Workout Plan Service & Athlete Telemetry Persistence
// Handles storage and management of workout plans and telemetry sessions.

const DEFAULT_DOCTOR_PLANS = {
  "ATH-202": {
    athleteId: "ATH-202",
    athleteName: "Alex Morgan",
    doctorId: "DOC-101",
    doctorName: "Dr. Valli",
    injuryId: "KJAC",
    phase: "Phase 2 - Controlled Neuromuscular & Quadriceps Loading",
    prescribedDate: new Date().toISOString(),
    clinicalNotes: "Patient exhibits solid static balance. Focus this week on maintaining heel weight during squats and controlled knee alignment. Do not allow knee valgus past 5 degrees.",
    exercises: [
      {
        id: "ex-1",
        title: "Single Leg Balance (Eyes Open)",
        reps: "3 sets x 30 seconds",
        targetJointAngle: "Standing knee flexion 5-10°",
        instructions: "Maintain hip level and keep core engaged.",
        completed: false
      },
      {
        id: "ex-2",
        title: "Assisted Deep Squats",
        reps: "3 sets x 12 reps",
        targetJointAngle: "Knee flexion up to 90°",
        instructions: "Keep knees aligned over 2nd toe; avoid medial collapse.",
        completed: false
      },
      {
        id: "ex-3",
        title: "Lateral Band Walks",
        reps: "2 sets x 15 steps per side",
        targetJointAngle: "Slight knee bend 20°",
        instructions: "Keep tension on resistance band throughout motion.",
        completed: false
      }
    ]
  },
  "ATH-303": {
    athleteId: "ATH-303",
    athleteName: "Nidheesh S",
    doctorId: "DOC-101",
    doctorName: "Dr. Valli",
    injuryId: "KJMT",
    phase: "Phase 3 - Eccentric Hamstring Lengthening & Speed Prep",
    prescribedDate: new Date().toISOString(),
    clinicalNotes: "Hamstring tear scar tissue resolving nicely. Progressing to Nordic eccentric strength and high-speed motor control.",
    exercises: [
      {
        id: "ex-301",
        title: "Nordic Hamstring Lowering",
        reps: "3 sets x 6 reps",
        targetJointAngle: "Controlled hip-knee extension",
        instructions: "Resist fall using hamstrings as long as possible.",
        completed: false
      }
    ]
  }
};

/**
 * Get active doctor-prescribed workout plan for an athlete
 */
export const getAthleteWorkoutPlan = (athleteId) => {
  try {
    const customPlans = JSON.parse(localStorage.getItem('rehab360_doctor_plans') || '{}');
    if (customPlans[athleteId]) {
      return customPlans[athleteId];
    }
  } catch (e) {}

  return DEFAULT_DOCTOR_PLANS[athleteId] || {
    athleteId,
    doctorId: "DOC-101",
    doctorName: "Dr. Valli",
    phase: "Phase 1 - Initial Assessment",
    clinicalNotes: "Awaiting doctor workout prescription.",
    exercises: []
  };
};

/**
 * Save or update a workout plan drafted by a Doctor
 */
export const saveDoctorWorkoutPlan = (plan) => {
  try {
    const customPlans = JSON.parse(localStorage.getItem('rehab360_doctor_plans') || '{}');
    customPlans[plan.athleteId] = {
      ...plan,
      prescribedDate: new Date().toISOString()
    };
    localStorage.setItem('rehab360_doctor_plans', JSON.stringify(customPlans));
    return true;
  } catch (e) {
    console.error("Failed to save doctor workout plan:", e);
    return false;
  }
};

/**
 * Saves a completed session with full telemetry and Gemini feedback
 */
export async function saveWorkoutSessionRecord({
  athleteId = 'ATH-202',
  exerciseId = 'squat',
  telemetryLog = [],
  report = {}
}) {
  const record = {
    id: `session-${Date.now()}`,
    athlete_id: athleteId,
    exercise_id: exerciseId,
    total_reps: report.stats?.totalReps || telemetryLog.length,
    avg_tempo_ms: report.stats?.avgDuration || 2000,
    fatigue_index_pct: report.stats?.fatigueIndexPct || 0,
    fault_summary: report.stats?.faultFrequency || {},
    raw_telemetry: telemetryLog,
    ai_summary_markdown: report.summaryMarkdown || '',
    created_at: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('rehab360_athlete_sessions') || '[]');
    existing.unshift(record);
    localStorage.setItem('rehab360_athlete_sessions', JSON.stringify(existing));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  return record;
}

/**
 * Fetches recent workout telemetry sessions for a given athlete
 */
export async function getAthleteWorkoutHistory(athleteId = 'ATH-202') {
  try {
    const stored = JSON.parse(localStorage.getItem('rehab360_athlete_sessions') || '[]');
    const filtered = stored.filter(s => s.athlete_id === athleteId || athleteId === 'all');
    if (filtered.length > 0) return filtered;
  } catch (e) {}

  // Initial Seed Record if empty
  return [
    {
      id: 'sess-demo-01',
      athlete_id: athleteId,
      exercise_id: 'squat',
      total_reps: 8,
      avg_tempo_ms: 2400,
      fatigue_index_pct: 18,
      fault_summary: { 'Knee Valgus Wobble': 2 },
      ai_summary_markdown: '### 📊 Session Summary\n- **Total Reps**: 8 reps\n- **Kinematics**: Stable range of motion peaked at 92° depth.\n- **Fatigue**: Minor +18% slowdown on final 2 reps.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
}
