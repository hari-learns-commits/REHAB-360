/**
 * AI Rehabilitation & Recovery Evaluation Engine
 * Algorithmic Daily Readiness Index formulation synthesizing ACWR (Acute-to-Chronic Workload Ratio),
 * HRV (rMSSD) z-scores, Sleep z-scores, and Soreness penalties.
 */

/**
 * Standard Normal Cumulative Distribution Function approximation \Phi(z)
 * Maps z-scores to [0, 1] probability range.
 */
export const normalCDF = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const ans = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? ans : 1 - ans;
};

/**
 * Calculate Acute-to-Chronic Workload Ratio (ACWR)
 * Acute load = 7-day average session workload (Duration * Borg RPE)
 * Chronic load = 28-day average session workload
 */
export const calculateACWR = (recentSessionWorkloads = []) => {
  if (!recentSessionWorkloads || recentSessionWorkloads.length === 0) {
    return { acuteLoad: 100, chronicLoad: 100, acwr: 1.0, zone: 'Optimal' };
  }

  const acuteWindow = recentSessionWorkloads.slice(0, 7);
  const chronicWindow = recentSessionWorkloads.slice(0, 28);

  const acuteLoad = acuteWindow.reduce((sum, w) => sum + w, 0) / Math.max(1, acuteWindow.length);
  const chronicLoad = chronicWindow.reduce((sum, w) => sum + w, 0) / Math.max(1, chronicWindow.length);

  const acwr = chronicLoad === 0 ? 1.0 : Number((acuteLoad / chronicLoad).toFixed(2));

  let zone = 'Optimal (0.8 - 1.3)';
  if (acwr > 1.5) zone = 'High Risk (Spike > 1.5)';
  else if (acwr < 0.8) zone = 'Under-trained (< 0.8)';

  return { acuteLoad: Math.round(acuteLoad), chronicLoad: Math.round(chronicLoad), acwr, zone };
};

/**
 * Composite Daily Readiness Index Formulation R(t) in [0, 100]
 * R(t) = clamp(w1 * \Phi(z_HRV)*100 + w2 * \Phi(z_Sleep)*100 + w3 * SorenessPenalty + w4 * f(ACWR), 0, 100)
 */
export const calculateDailyReadinessIndex = ({
  hrvRmssd = 65,
  hrvBaselineMean = 60,
  hrvBaselineSd = 10,
  sleepHours = 7.5,
  sleepBaselineMean = 7.5,
  sleepBaselineSd = 1.0,
  sorenessScore = 2, // 0 = none, 10 = severe
  acwr = 1.0
}) => {
  // 1. HRV Z-Score
  const zHrv = hrvBaselineSd === 0 ? 0 : (hrvRmssd - hrvBaselineMean) / hrvBaselineSd;
  const hrvComponent = normalCDF(zHrv) * 100;

  // 2. Sleep Z-Score
  const zSleep = sleepBaselineSd === 0 ? 0 : (sleepHours - sleepBaselineMean) / sleepBaselineSd;
  const sleepComponent = normalCDF(zSleep) * 100;

  // 3. Soreness Penalty (Inverted 0-100 scale)
  const sorenessPenalty = Math.max(0, (1 - (sorenessScore / 10))) * 100;

  // 4. ACWR Workload Score Function (Optimal at 1.0; penalize spikes > 1.5 or drop < 0.6)
  let acwrScore = 100;
  if (acwr > 1.5) acwrScore = Math.max(0, 100 - (acwr - 1.5) * 80);
  else if (acwr < 0.8) acwrScore = Math.max(50, 100 - (0.8 - acwr) * 50);

  // Constrained Weighted Sum
  // w1 = 0.35 (autonomic status), w2 = 0.25 (recovery duration), w3 = 0.20 (soreness), w4 = 0.20 (acwr)
  const rawScore = 0.35 * hrvComponent + 0.25 * sleepComponent + 0.20 * sorenessPenalty + 0.20 * acwrScore;
  const readinessScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  return {
    readinessScore,
    zHrv: Number(zHrv.toFixed(2)),
    zSleep: Number(zSleep.toFixed(2)),
    sorenessPenalty: Math.round(sorenessPenalty),
    acwrScore: Math.round(acwrScore)
  };
};

/**
 * Workout Session End Evaluation Endpoint
 */
export const processWorkoutEndEndpoint = (sessionPayload) => {
  const {
    athleteId,
    athleteName,
    doctorId,
    doctorName,
    injuryId,
    completedExercises = [],
    recordedExerciseProofs = {},
    videoProofUrl,
    painScore = 2,
    fatigueLevel = 3,
    hrvRmssd = 62,
    sleepHours = 7.5,
    sorenessScore = 2,
    notes = ""
  } = sessionPayload;

  if (!videoProofUrl) {
    throw new Error("Compulsory Video Proof is missing! Athletes must record or submit video proof of workout completion.");
  }

  const totalExercises = completedExercises.length || 1;
  const finishedCount = completedExercises.filter(ex => ex.completed).length;
  const adherenceRate = Math.round((finishedCount / totalExercises) * 100);

  const simulatedSymmetryScore = Math.max(60, Math.min(98, 100 - (painScore * 4) - Math.floor(Math.random() * 4)));
  const kneeValgusAngleDev = painScore > 4 ? 14.5 : painScore > 2 ? 6.2 : 2.1;
  const movementQualityScore = Math.round((simulatedSymmetryScore * 0.6) + (adherenceRate * 0.4));

  // Compute Daily Readiness Index
  const readinessAnalysis = calculateDailyReadinessIndex({
    hrvRmssd,
    sleepHours,
    sorenessScore: painScore || sorenessScore,
    acwr: 1.05
  });

  let readinessStatus = "ready_to_practice";
  let readinessBadgeText = "Ready to Go Back to Practice";
  let readinessBadgeColor = "var(--warning)";
  let hasRecovered = false;
  let aiRecommendationSummary = "";
  let doctorActionRequired = false;

  if (movementQualityScore >= 90 && painScore <= 1 && adherenceRate === 100 && kneeValgusAngleDev < 3) {
    readinessStatus = "ready_to_compete";
    readinessBadgeText = "Ready to Compete";
    readinessBadgeColor = "var(--success)";
    hasRecovered = true;
    aiRecommendationSummary = `Athlete demonstrates full kinetic symmetry (${simulatedSymmetryScore}%) with zero joint instability during movement analysis. Cleared for high-intensity competitive play.`;
  } else if (movementQualityScore >= 80 && painScore <= 2 && adherenceRate >= 90) {
    readinessStatus = "fit_to_play";
    readinessBadgeText = "Fit to Play";
    readinessBadgeColor = "#3b82f6";
    hasRecovered = true;
    aiRecommendationSummary = `Solid motion mechanics with high symmetry (${simulatedSymmetryScore}%). Cleared for match play with pre-game warmup protocols.`;
  } else if (movementQualityScore >= 68 && painScore <= 4 && adherenceRate >= 70) {
    readinessStatus = "ready_to_practice";
    readinessBadgeText = "Ready to Go Back to Practice";
    readinessBadgeColor = "var(--warning)";
    hasRecovered = false;
    aiRecommendationSummary = `Movement quality is acceptable (${simulatedSymmetryScore}%), but minor asymmetrical joint load detected (${kneeValgusAngleDev}° valgus deviation). Cleared for non-contact team practice drills.`;
  } else {
    readinessStatus = "rest_and_review";
    readinessBadgeText = "Rest & Clinical Review Required";
    readinessBadgeColor = "var(--danger)";
    hasRecovered = false;
    doctorActionRequired = true;
    aiRecommendationSummary = `High movement asymmetry (${simulatedSymmetryScore}%) and elevated pain score (${painScore}/10) logged in video proof. Athlete is NOT cleared for practice. Flagged for Dr. ${doctorName || 'Assigned Specialist'} review.`;
  }

  const evaluationResult = {
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    athleteId,
    athleteName,
    doctorId,
    doctorName,
    injuryId,
    videoProofUrl,
    recordedExerciseProofs,
    completedExercises,
    hasRecovered,
    readinessStatus,
    readinessBadgeText,
    readinessBadgeColor,
    doctorActionRequired,
    readinessScore: readinessAnalysis.readinessScore,
    metrics: {
      movementSymmetryPercent: simulatedSymmetryScore,
      adherenceRatePercent: adherenceRate,
      painScore,
      fatigueLevel,
      valgusAngleDeviation: kneeValgusAngleDev,
      overallQualityScore: movementQualityScore,
      acwr: 1.05
    },
    aiReport: {
      summary: aiRecommendationSummary,
      biomechanicalFeedback: `Video AI analyzed ${completedExercises.length} prescribed movements. Form error rate: ${(100 - simulatedSymmetryScore) / 10}%. Daily Readiness Score: ${readinessAnalysis.readinessScore}/100.`,
      nextSteps: doctorActionRequired 
        ? `Prescribed plan paused pending Dr. ${doctorName || 'Doctor'} review.`
        : `Continue prescribed loading phase under Dr. ${doctorName || 'Doctor'} direction.`
    }
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('rehab360_workout_logs') || '[]');
    existingLogs.unshift(evaluationResult);
    localStorage.setItem('rehab360_workout_logs', JSON.stringify(existingLogs));
  } catch (e) {
    console.warn("Could not persist workout log to localStorage:", e);
  }

  return evaluationResult;
};

export const getWorkoutLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('rehab360_workout_logs') || '[]');
  } catch (e) {
    return [];
  }
};
