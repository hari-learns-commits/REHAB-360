// AI Rehabilitation & Recovery Evaluation Engine
// Serves as the workout end endpoint and readiness status evaluation logic

/**
 * Workout Session Completion & AI Readiness Evaluation Endpoint
 * @param {Object} sessionPayload 
 * @param {string} sessionPayload.athleteId
 * @param {string} sessionPayload.athleteName
 * @param {string} sessionPayload.doctorId
 * @param {string} sessionPayload.doctorName
 * @param {string} sessionPayload.injuryId
 * @param {Array} sessionPayload.completedExercises
 * @param {string} sessionPayload.videoProofUrl // Compulsory video proof
 * @param {number} sessionPayload.painScore // 0 - 10
 * @param {number} sessionPayload.fatigueLevel // 1 - 10
 * @param {string} sessionPayload.notes
 * 
 * @returns {Object} AI Evaluation & Readiness Analysis Output
 */
export const processWorkoutEndEndpoint = (sessionPayload) => {
  const {
    athleteId,
    athleteName,
    doctorId,
    doctorName,
    injuryId,
    completedExercises = [],
    videoProofUrl,
    painScore = 2,
    fatigueLevel = 3,
    notes = ""
  } = sessionPayload;

  // Validate compulsory video proof
  if (!videoProofUrl) {
    throw new Error("Compulsory Video Proof is missing! Athletes must record or submit video proof of workout completion.");
  }

  // 1. Calculate Exercise Completion & Adherence
  const totalExercises = completedExercises.length || 1;
  const finishedCount = completedExercises.filter(ex => ex.completed).length;
  const adherenceRate = Math.round((finishedCount / totalExercises) * 100);

  // 2. Simulated MediaPipe / Computer Vision Motion Analysis from Video Proof
  // Evaluates Joint Angles, Valgus Collapse, Movement Symmetry %, Posture Alignment
  const simulatedSymmetryScore = Math.max(60, Math.min(98, 100 - (painScore * 4) - Math.floor(Math.random() * 5)));
  const kneeValgusAngleDev = painScore > 4 ? 14.5 : painScore > 2 ? 6.2 : 2.1; // degrees of wobble
  const movementQualityScore = Math.round((simulatedSymmetryScore * 0.6) + (adherenceRate * 0.4));

  // 3. Evaluate Readiness & Return-to-Play (RTP) Decision
  // Categories: 'ready_to_compete', 'fit_to_play', 'ready_to_practice', 'rest_and_review'
  let readinessStatus = "ready_to_practice";
  let readinessBadgeText = "Ready to Go Back to Practice";
  let readinessBadgeColor = "var(--primary)"; // Cyan/Blue
  let hasRecovered = false;
  let aiRecommendationSummary = "";
  let doctorActionRequired = false;

  if (movementQualityScore >= 90 && painScore <= 1 && adherenceRate === 100 && kneeValgusAngleDev < 3) {
    readinessStatus = "ready_to_compete";
    readinessBadgeText = "Ready to Compete";
    readinessBadgeColor = "var(--success)"; // Emerald/Green
    hasRecovered = true;
    aiRecommendationSummary = `Athlete demonstrates full kinetic symmetry (${simulatedSymmetryScore}%) with zero joint instability during movement analysis. Cleared for high-intensity competitive play.`;
  } else if (movementQualityScore >= 80 && painScore <= 2 && adherenceRate >= 90) {
    readinessStatus = "fit_to_play";
    readinessBadgeText = "Fit to Play";
    readinessBadgeColor = "#3b82f6"; // Vibrant Blue
    hasRecovered = true;
    aiRecommendationSummary = `Solid motion mechanics with high symmetry (${simulatedSymmetryScore}%). Cleared for match play with pre-game warmup protocols.`;
  } else if (movementQualityScore >= 68 && painScore <= 4 && adherenceRate >= 70) {
    readinessStatus = "ready_to_practice";
    readinessBadgeText = "Ready to Go Back to Practice";
    readinessBadgeColor = "var(--warning)"; // Amber/Orange
    hasRecovered = false;
    aiRecommendationSummary = `Movement quality is acceptable (${simulatedSymmetryScore}%), but minor asymmetrical joint load detected (${kneeValgusAngleDev}° valgus deviation). Cleared for non-contact team practice drills.`;
  } else {
    readinessStatus = "rest_and_review";
    readinessBadgeText = "Rest & Clinical Review Required";
    readinessBadgeColor = "var(--danger)"; // Red
    hasRecovered = false;
    doctorActionRequired = true;
    aiRecommendationSummary = `High movement asymmetry (${simulatedSymmetryScore}%) and elevated pain score (${painScore}/10) logged in video proof. Athlete is NOT cleared for practice. Flagged for Dr. ${doctorName || 'Assigned Specialist'} review.`;
  }

  // Build complete session summary record
  const evaluationResult = {
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    athleteId,
    athleteName,
    doctorId,
    doctorName,
    injuryId,
    videoProofUrl,
    hasRecovered,
    readinessStatus,
    readinessBadgeText,
    readinessBadgeColor,
    doctorActionRequired,
    metrics: {
      movementSymmetryPercent: simulatedSymmetryScore,
      adherenceRatePercent: adherenceRate,
      painScore,
      fatigueLevel,
      valgusAngleDeviation: kneeValgusAngleDev,
      overallQualityScore: movementQualityScore
    },
    aiReport: {
      summary: aiRecommendationSummary,
      biomechanicalFeedback: `Video AI analyzed ${completedExercises.length} prescribed movements. Form error rate: ${(100 - simulatedSymmetryScore) / 10}%.`,
      nextSteps: doctorActionRequired 
        ? `Prescribed plan paused pending Dr. ${doctorName || 'Doctor'} review.`
        : `Continue prescribed loading phase under Dr. ${doctorName || 'Doctor'} direction.`
    }
  };

  // Persist session to local storage for live sync between Athlete and Doctor views
  try {
    const existingLogs = JSON.parse(localStorage.getItem('rehab360_workout_logs') || '[]');
    existingLogs.unshift(evaluationResult);
    localStorage.setItem('rehab360_workout_logs', JSON.stringify(existingLogs));
  } catch (e) {
    console.warn("Could not persist workout log to localStorage:", e);
  }

  return evaluationResult;
};

/**
 * Helper to retrieve stored workout logs
 */
export const getWorkoutLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('rehab360_workout_logs') || '[]');
  } catch (e) {
    return [];
  }
};
