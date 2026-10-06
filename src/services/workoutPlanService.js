// Doctor-Directed Workout Plan Service
// Handles storage and management of workout plans created by Doctors for Athletes.

// Default initial plans prescribed by Dr. Valli for Alex Morgan and Nidheesh S
const DEFAULT_DOCTOR_PLANS = {
  "ATH-202": {
    athleteId: "ATH-202",
    athleteName: "Alex Morgan",
    doctorId: "DOC-101",
    doctorName: "Dr. Valli",
    injuryId: "KNEE_001",
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
      },
      {
        id: "ex-4",
        title: "Terminal Knee Extension (TKE)",
        reps: "3 sets x 15 reps",
        targetJointAngle: "0° Full extension",
        instructions: "Squeeze VMO muscle at full extension point for 2 seconds.",
        completed: false
      }
    ]
  },
  "ATH-303": {
    athleteId: "ATH-303",
    athleteName: "Nidheesh S",
    doctorId: "DOC-101",
    doctorName: "Dr. Valli",
    injuryId: "THIGH_001",
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
      },
      {
        id: "ex-302",
        title: "Single Leg Romanian Deadlift",
        reps: "3 sets x 10 reps",
        targetJointAngle: "Hip hinge 80°",
        instructions: "Maintain neutral spine and feel stretch in hamstrings.",
        completed: false
      },
      {
        id: "ex-303",
        title: "Prone Hamstring Curls",
        reps: "3 sets x 12 reps",
        targetJointAngle: "Knee flexion 0 to 110°",
        instructions: "Slow 3-second eccentric release on down stroke.",
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
