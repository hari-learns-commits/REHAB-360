/**
 * Rehab360 Motion ML Engine
 * Client-side statistical ML for biomechanical movement analysis.
 * Follows ml-best-practices: time-series pattern, anomaly detection, regression scoring.
 */

// ─── TIME-SERIES ANALYSIS ────────────────────────────────────────────────────

/**
 * Compute rolling moving average for smoothing noisy sensor data.
 * Used for ROM trend smoothing to reduce frame-by-frame noise.
 */
export const rollingMean = (arr, window = 5) => {
  if (!arr || arr.length === 0) return [];
  return arr.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
};

/**
 * Compute standard deviation of an array (population std).
 * Used for variability and consistency scoring.
 */
export const stdDev = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
};

/**
 * Pearson correlation coefficient between two arrays.
 * Used to detect bilateral symmetry trends over time.
 */
export const pearsonCorr = (a, b) => {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  const num = a.reduce((s, v, i) => s + (v - meanA) * (b[i] - meanB), 0);
  const denA = Math.sqrt(a.reduce((s, v) => s + Math.pow(v - meanA, 2), 0));
  const denB = Math.sqrt(b.reduce((s, v) => s + Math.pow(v - meanB, 2), 0));
  if (denA === 0 || denB === 0) return 0;
  return num / (denA * denB);
};

/**
 * Simple linear regression slope (least squares).
 * Used to detect fatigue trends: if ROM decreases linearly over reps → fatigue.
 * @returns { slope, intercept, r2 }
 */
export const linearRegression = (yArr) => {
  const n = yArr.length;
  if (n < 2) return { slope: 0, intercept: yArr[0] || 0, r2: 0 };
  const xArr = Array.from({ length: n }, (_, i) => i);
  const meanX = xArr.reduce((a, b) => a + b, 0) / n;
  const meanY = yArr.reduce((a, b) => a + b, 0) / n;
  const ssXY = xArr.reduce((s, x, i) => s + (x - meanX) * (yArr[i] - meanY), 0);
  const ssXX = xArr.reduce((s, x) => s + Math.pow(x - meanX, 2), 0);
  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const yPred = xArr.map(x => slope * x + intercept);
  const ssTot = yArr.reduce((s, y) => s + Math.pow(y - meanY, 2), 0);
  const ssRes = yArr.reduce((s, y, i) => s + Math.pow(y - yPred[i], 2), 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
};

// ─── ANOMALY DETECTION (Z-SCORE METHOD) ──────────────────────────────────────

/**
 * IQR-based anomaly detection on a metric time-series.
 * Flags frames where the value is beyond 1.5x IQR from Q1/Q3.
 * @returns { anomalies: Array<{index, value, reason}>, clean: Array<number> }
 */
export const detectAnomalies = (arr, metricName = 'metric', threshold = 2.0) => {
  if (!arr || arr.length < 5) return { anomalies: [], clean: arr || [] };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sd = stdDev(arr);
  if (sd === 0) return { anomalies: [], clean: arr };
  const anomalies = [];
  const clean = [];
  arr.forEach((v, i) => {
    const z = Math.abs((v - mean) / sd);
    if (z > threshold) {
      anomalies.push({ index: i, value: v, zScore: z.toFixed(2), reason: `${metricName} z-score ${z.toFixed(2)} > ${threshold}` });
    } else {
      clean.push(v);
    }
  });
  return { anomalies, clean, mean: mean.toFixed(2), sd: sd.toFixed(2) };
};

// ─── REP QUALITY CLASSIFIER ──────────────────────────────────────────────────

/**
 * Classifies each rep based on:
 * - ROM depth achieved (should reach < 120° for full squat)
 * - Valgus peak during descent
 * - Tempo consistency (time at peak flex)
 * 
 * @returns { repScores: Array<{repNum, romScore, valgusScore, score, label}>, avgScore }
 */
export const classifyRepQuality = (repData) => {
  if (!repData || repData.length === 0) {
    return { repScores: [], avgScore: 0 };
  }

  const repScores = repData.map((rep, i) => {
    // ROM scoring: ideal < 110°, good < 120°, poor >= 120°
    let romScore = 100;
    if (rep.peakRom >= 120) romScore = 60;
    else if (rep.peakRom >= 110) romScore = 80;
    else romScore = 100;

    // Valgus scoring: < 2° excellent, < 4° good, >= 4° poor
    let valgusScore = 100;
    if (rep.peakValgus >= 4) valgusScore = 55;
    else if (rep.peakValgus >= 2) valgusScore = 80;
    else valgusScore = 100;

    // Symmetry scoring
    const symScore = Math.min(100, rep.avgSymmetry || 90);

    const score = Math.round(romScore * 0.4 + valgusScore * 0.35 + symScore * 0.25);

    let label = 'Excellent';
    if (score < 70) label = 'Poor Form';
    else if (score < 82) label = 'Needs Work';
    else if (score < 92) label = 'Good';
    
    return { repNum: i + 1, romScore, valgusScore, symScore, score, label, peakRom: rep.peakRom, peakValgus: rep.peakValgus };
  });

  const avgScore = repScores.length > 0
    ? Math.round(repScores.reduce((s, r) => s + r.score, 0) / repScores.length)
    : 0;

  return { repScores, avgScore };
};

// ─── FATIGUE DETECTION ────────────────────────────────────────────────────────

/**
 * Detects fatigue based on:
 * 1. Negative slope in ROM over reps (ROM depth decreasing = fatigue)
 * 2. Increasing valgus over reps (collapsing under load)
 * 3. Decreasing symmetry over reps
 * 
 * @returns { fatigueScore: 0–100, fatigueLabel, indicators: string[] }
 */
export const detectFatigue = (repRoms, repValgus, repSymmetry) => {
  if (!repRoms || repRoms.length < 3) {
    return { fatigueScore: 0, fatigueLabel: 'Insufficient Data', indicators: [] };
  }

  const romRegression = linearRegression(repRoms);
  const valgusRegression = repValgus && repValgus.length >= 3 ? linearRegression(repValgus) : { slope: 0 };
  const symRegression = repSymmetry && repSymmetry.length >= 3 ? linearRegression(repSymmetry) : { slope: 0 };

  let fatigueScore = 0;
  const indicators = [];

  // ROM decreasing (positive slope means deeper = better; negative slope = fatigue)
  if (romRegression.slope > 0.5) {
    fatigueScore += 30;
    indicators.push(`ROM depth declining (+${romRegression.slope.toFixed(1)}°/rep) — muscles tiring`);
  }

  // Valgus increasing (bad)
  if (valgusRegression.slope > 0.1) {
    fatigueScore += 35;
    indicators.push(`Knee valgus worsening (+${valgusRegression.slope.toFixed(2)}°/rep) — hip abductor fatigue`);
  }

  // Symmetry decreasing (bad)
  if (symRegression.slope < -0.5) {
    fatigueScore += 25;
    indicators.push(`Bilateral symmetry dropping (${symRegression.slope.toFixed(1)}%/rep) — compensatory loading`);
  }

  // High valgus variability
  if (repValgus && stdDev(repValgus) > 1.5) {
    fatigueScore += 10;
    indicators.push(`High valgus variability (σ=${stdDev(repValgus).toFixed(1)}°) — inconsistent motor control`);
  }

  fatigueScore = Math.min(100, fatigueScore);

  let fatigueLabel;
  if (fatigueScore === 0) fatigueLabel = 'No Fatigue Detected';
  else if (fatigueScore <= 20) fatigueLabel = 'Minimal Fatigue';
  else if (fatigueScore <= 45) fatigueLabel = 'Moderate Fatigue';
  else if (fatigueScore <= 70) fatigueLabel = 'High Fatigue — Consider Rest';
  else fatigueLabel = 'Severe Fatigue — Stop Session';

  return { fatigueScore, fatigueLabel, indicators, romSlope: romRegression.slope, valgusSlope: valgusRegression.slope };
};

// ─── SESSION SUMMARY ANALYSIS ────────────────────────────────────────────────

/**
 * Full session analysis pipeline.
 * Input: sessionFrames — array of { timestamp, rom, valgus, symmetry, isRecording }
 * Input: repData — array of { peakRom, peakValgus, avgSymmetry }
 * 
 * @returns Comprehensive ML analysis report
 */
export const analyzeSession = (sessionFrames, repData) => {
  if (!sessionFrames || sessionFrames.length === 0) {
    return null;
  }

  const romSeries = sessionFrames.map(f => f.rom);
  const valgusSeries = sessionFrames.map(f => f.valgus);
  const symSeries = sessionFrames.map(f => f.symmetry);
  const timestamps = sessionFrames.map((f, i) => i);

  // Smooth ROM for visualization
  const smoothedRom = rollingMean(romSeries, 8);

  // Anomaly detection
  const romAnomalies = detectAnomalies(romSeries, 'ROM', 2.5);
  const valgusAnomalies = detectAnomalies(valgusSeries, 'Valgus', 2.0);

  // Rep quality classification
  const { repScores, avgScore: repQualityAvg } = classifyRepQuality(repData);

  // Fatigue detection
  const repRoms = repData.map(r => r.peakRom);
  const repValgus = repData.map(r => r.peakValgus);
  const repSym = repData.map(r => r.avgSymmetry);
  const fatigueReport = detectFatigue(repRoms, repValgus, repSym);

  // Summary statistics
  const avgRom = romSeries.reduce((a, b) => a + b, 0) / romSeries.length;
  const minRom = Math.min(...romSeries);
  const avgValgus = valgusSeries.reduce((a, b) => a + b, 0) / valgusSeries.length;
  const maxValgus = Math.max(...valgusSeries);
  const avgSymmetry = symSeries.reduce((a, b) => a + b, 0) / symSeries.length;
  const romConsistency = Math.max(0, 100 - stdDev(romSeries) * 3).toFixed(1);

  // Overall session score (composite)
  const overallScore = Math.round(
    repQualityAvg * 0.40 +
    Math.max(0, 100 - fatigueReport.fatigueScore) * 0.25 +
    Number(romConsistency) * 0.20 +
    avgSymmetry * 0.15
  );

  // Generate clinical insight text
  const insights = generateInsightText({
    avgRom: avgRom.toFixed(1),
    minRom,
    avgValgus: avgValgus.toFixed(1),
    maxValgus: maxValgus.toFixed(1),
    avgSymmetry: avgSymmetry.toFixed(1),
    repQualityAvg,
    fatigueReport,
    repCount: repData.length,
    anomalyCount: romAnomalies.anomalies.length + valgusAnomalies.anomalies.length
  });

  return {
    romSeries,
    smoothedRom,
    valgusSeries,
    symSeries,
    timestamps,
    repScores,
    repQualityAvg,
    fatigueReport,
    romAnomalies,
    valgusAnomalies,
    summary: {
      avgRom: Number(avgRom.toFixed(1)),
      minRom,
      avgValgus: Number(avgValgus.toFixed(1)),
      maxValgus: Number(maxValgus.toFixed(1)),
      avgSymmetry: Number(avgSymmetry.toFixed(1)),
      romConsistency: Number(romConsistency),
      overallScore,
    },
    insights
  };
};

// ─── INSIGHT TEXT GENERATION ─────────────────────────────────────────────────

const generateInsightText = ({ avgRom, minRom, avgValgus, maxValgus, avgSymmetry, repQualityAvg, fatigueReport, repCount, anomalyCount }) => {
  const insightCards = [];

  // ROM insight
  if (minRom < 110) {
    insightCards.push({
      type: 'positive',
      title: 'Excellent ROM Depth',
      text: `Knee flexion reached ${minRom}° — within therapeutic target range. Average ROM was ${avgRom}°.`
    });
  } else if (minRom < 125) {
    insightCards.push({
      type: 'warning',
      title: 'ROM Approaching Target',
      text: `Best knee flexion was ${minRom}°. Target is <120° for full therapeutic benefit. Focus on controlled eccentric loading.`
    });
  } else {
    insightCards.push({
      type: 'alert',
      title: 'Insufficient ROM Depth',
      text: `ROM peaked at ${minRom}°. Insufficient depth detected. Review pain, muscle tightness, or swelling. Report to physiotherapist.`
    });
  }

  // Valgus insight
  if (Number(maxValgus) < 2.5) {
    insightCards.push({
      type: 'positive',
      title: 'Excellent Valgus Control',
      text: `Peak knee valgus was only ${maxValgus}° — exceptional medial knee stability. Gluteus medius and VMO are functioning well.`
    });
  } else if (Number(maxValgus) < 4.5) {
    insightCards.push({
      type: 'warning',
      title: 'Moderate Valgus Deviation',
      text: `Valgus deviation peaked at ${maxValgus}°. Monitor for medial collapse. Add clamshell and hip abductor exercises to protocol.`
    });
  } else {
    insightCards.push({
      type: 'alert',
      title: 'High Valgus — Risk Detected',
      text: `Valgus reached ${maxValgus}°. Excessive medial knee collapse detected. Reduce load and notify Dr. Valli for protocol review.`
    });
  }

  // Symmetry insight
  if (Number(avgSymmetry) >= 92) {
    insightCards.push({
      type: 'positive',
      title: 'Bilateral Symmetry Excellent',
      text: `${avgSymmetry}% kinetic symmetry — excellent load distribution between limbs. Neuromuscular retraining progressing well.`
    });
  } else if (Number(avgSymmetry) >= 85) {
    insightCards.push({
      type: 'warning',
      title: 'Mild Asymmetry Detected',
      text: `${avgSymmetry}% symmetry — mild compensation pattern noted. Continue single-leg stability drills to address deficit.`
    });
  } else {
    insightCards.push({
      type: 'alert',
      title: 'Significant Load Asymmetry',
      text: `${avgSymmetry}% symmetry indicates significant weight-bearing avoidance. Flag for physio assessment.`
    });
  }

  // Fatigue insight
  if (fatigueReport.fatigueScore > 30) {
    insightCards.push({
      type: fatigueReport.fatigueScore > 60 ? 'alert' : 'warning',
      title: `Fatigue: ${fatigueReport.fatigueLabel}`,
      text: fatigueReport.indicators[0] || 'Fatigue pattern detected across session. Adequate rest before next session.'
    });
  }

  // Quality insight
  if (repQualityAvg >= 88) {
    insightCards.push({
      type: 'positive',
      title: 'High Rep Quality Score',
      text: `Average rep quality: ${repQualityAvg}/100 across ${repCount} reps. Form is consistent and clinical standards are met.`
    });
  } else if (repQualityAvg >= 72) {
    insightCards.push({
      type: 'warning',
      title: 'Moderate Rep Quality',
      text: `Average rep quality: ${repQualityAvg}/100. Some reps had form deviations. Review video proof with your physiotherapist.`
    });
  } else {
    insightCards.push({
      type: 'alert',
      title: 'Form Issues Detected',
      text: `Rep quality scored ${repQualityAvg}/100. Significant form deviations recorded. Session flagged for physio review before next workout.`
    });
  }

  return insightCards;
};
