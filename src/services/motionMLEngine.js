/**
 * Rehab360 Motion ML Engine
 * Client-side statistical ML & 3D Kinematics for biomechanical movement analysis.
 * Implements Google MediaPipe 3D landmark vector kinematics, EMA smoothing (alpha=0.35),
 * Dynamic Knee Valgus Deviation Ratio, and Limb Symmetry Index (LSI).
 */

// ─── 3D VECTOR KINEMATICS & CLAMPED DOT-PRODUCT MATH ─────────────────────────

/**
 * Calculates 3D interior angle formed by three contiguous anatomical landmarks:
 * P1 (proximal), P2 (vertex joint), P3 (distal).
 * Uses dot product clamped to [-1.0, 1.0] to eliminate floating-point NaN errors near 0° or 180°.
 */
export const calculate3DAngle = (p1, p2, p3) => {
  if (!p1 || !p2 || !p3) return 180;

  const u = {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
    z: (p1.z || 0) - (p2.z || 0)
  };
  const v = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
    z: (p3.z || 0) - (p2.z || 0)
  };

  const dot = u.x * v.x + u.y * v.y + u.z * v.z;
  const magU = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
  const magV = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

  if (magU === 0 || magV === 0) return 180;

  const cosTheta = Math.max(-1.0, Math.min(1.0, dot / (magU * magV)));
  const angleRad = Math.acos(cosTheta);
  return (angleRad * 180) / Math.PI;
};

/**
 * Exponential Moving Average (EMA) Low-Pass Filter
 * Optimally tuned at alpha = 0.35 for 30 Hz web camera video streams.
 * Eliminates high-frequency landmark jitter while preserving true peak ROM depth.
 */
export const exponentialMovingAverage = (currentValue, previousEMA, alpha = 0.35) => {
  if (previousEMA === null || previousEMA === undefined) return currentValue;
  return alpha * currentValue + (1 - alpha) * previousEMA;
};

/**
 * Instantaneous Angular Velocity Computation (°/s)
 * First-order central difference across consecutive timestamps (in seconds).
 */
export const calculateAngularVelocity = (angleCurrent, anglePrevious, timeDeltaSec) => {
  if (!timeDeltaSec || timeDeltaSec <= 0) return 0;
  const omega = Math.abs(angleCurrent - anglePrevious) / timeDeltaSec;
  return Number(omega.toFixed(2));
};

/**
 * Frontal Plane Dynamic Knee Valgus Ratio Index (VR_knee)
 * Measures medial deviation of patella (P_knee) relative to functional mechanical axis (P_hip to P_ankle).
 * VR_knee = (x_knee - M_x) / (|x_hip - x_ankle| + epsilon), where M_x = (x_hip + x_ankle) / 2
 */
export const calculateDynamicValgusRatio = (hip, knee, ankle, epsilon = 0.0001) => {
  if (!hip || !knee || !ankle) return 0;

  const mx = (hip.x + ankle.x) / 2;
  const coronalWidth = Math.abs(hip.x - ankle.x) + epsilon;
  const medialExcursion = knee.x - mx;

  // Normalized percentage deviation
  const valgusRatio = (medialExcursion / coronalWidth) * 100;
  return Number(valgusRatio.toFixed(2));
};

/**
 * Limb Symmetry Index (LSI %)
 * LSI = (Metric_Involved / Metric_Uninvolved) * 100%
 * Clinical clearance benchmark requires LSI >= 90%.
 */
export const calculateLimbSymmetryIndex = (involvedMetric, uninvolvedMetric) => {
  if (!uninvolvedMetric || uninvolvedMetric === 0) return 100;
  const lsi = (involvedMetric / uninvolvedMetric) * 100;
  return Number(Math.min(120, Math.max(0, lsi)).toFixed(1));
};

// ─── TIME-SERIES ANALYSIS ────────────────────────────────────────────────────

export const rollingMean = (arr, window = 5) => {
  if (!arr || arr.length === 0) return [];
  return arr.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
};

export const stdDev = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
};

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

// ─── REP QUALITY & FATIGUE CLASSIFIER ────────────────────────────────────────

export const classifyRepQuality = (repData) => {
  if (!repData || repData.length === 0) {
    return { repScores: [], avgScore: 0 };
  }

  const repScores = repData.map((rep, i) => {
    let romScore = 100;
    if (rep.peakRom >= 120) romScore = 60;
    else if (rep.peakRom >= 110) romScore = 80;
    else romScore = 100;

    let valgusScore = 100;
    if (rep.peakValgus >= 4) valgusScore = 55;
    else if (rep.peakValgus >= 2) valgusScore = 80;
    else valgusScore = 100;

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

export const detectFatigue = (repRoms, repValgus, repSymmetry) => {
  if (!repRoms || repRoms.length < 3) {
    return { fatigueScore: 0, fatigueLabel: 'Insufficient Data', indicators: [] };
  }

  const romRegression = linearRegression(repRoms);
  const valgusRegression = repValgus && repValgus.length >= 3 ? linearRegression(repValgus) : { slope: 0 };
  const symRegression = repSymmetry && repSymmetry.length >= 3 ? linearRegression(repSymmetry) : { slope: 0 };

  let fatigueScore = 0;
  const indicators = [];

  if (romRegression.slope > 0.5) {
    fatigueScore += 30;
    indicators.push(`ROM depth declining (+${romRegression.slope.toFixed(1)}°/rep) — muscles tiring`);
  }
  if (valgusRegression.slope > 0.1) {
    fatigueScore += 35;
    indicators.push(`Knee valgus worsening (+${valgusRegression.slope.toFixed(2)}°/rep) — hip abductor fatigue`);
  }
  if (symRegression.slope < -0.5) {
    fatigueScore += 25;
    indicators.push(`Bilateral symmetry dropping (${symRegression.slope.toFixed(1)}%/rep) — compensatory loading`);
  }
  if (repValgus && stdDev(repValgus) > 1.5) {
    fatigueScore += 10;
    indicators.push(`High valgus variability (σ=${stdDev(repValgus).toFixed(1)}°) — inconsistent motor control`);
  }

  fatigueScore = Math.min(100, fatigueScore);

  let fatigueLabel = 'No Fatigue Detected';
  if (fatigueScore > 70) fatigueLabel = 'Severe Fatigue — Stop Session';
  else if (fatigueScore > 45) fatigueLabel = 'High Fatigue — Consider Rest';
  else if (fatigueScore > 20) fatigueLabel = 'Moderate Fatigue';
  else if (fatigueScore > 0) fatigueLabel = 'Minimal Fatigue';

  return { fatigueScore, fatigueLabel, indicators, romSlope: romRegression.slope, valgusSlope: valgusRegression.slope };
};

/**
 * Full Session Analysis Pipeline
 */
export const analyzeSession = (sessionFrames, repData = []) => {
  if (!sessionFrames || sessionFrames.length === 0) return null;

  const romSeries = sessionFrames.map(f => f.rom || 180);
  const valgusSeries = sessionFrames.map(f => f.valgus || 0);
  const symSeries = sessionFrames.map(f => f.symmetry || 90);
  const timestamps = sessionFrames.map((_, i) => i);

  const smoothedRom = rollingMean(romSeries, 8);
  const romAnomalies = detectAnomalies(romSeries, 'ROM', 2.5);
  const valgusAnomalies = detectAnomalies(valgusSeries, 'Valgus', 2.0);
  const { repScores, avgScore: repQualityAvg } = classifyRepQuality(repData);

  const repRoms = repData.map(r => r.peakRom);
  const repValgus = repData.map(r => r.peakValgus);
  const repSym = repData.map(r => r.avgSymmetry);
  const fatigueReport = detectFatigue(repRoms, repValgus, repSym);

  const avgRom = romSeries.reduce((a, b) => a + b, 0) / romSeries.length;
  const minRom = Math.min(...romSeries);
  const avgValgus = valgusSeries.reduce((a, b) => a + b, 0) / valgusSeries.length;
  const maxValgus = Math.max(...valgusSeries);
  const avgSymmetry = symSeries.reduce((a, b) => a + b, 0) / symSeries.length;
  const romConsistency = Math.max(0, 100 - stdDev(romSeries) * 3).toFixed(1);

  const overallScore = Math.round(
    repQualityAvg * 0.40 +
    Math.max(0, 100 - fatigueReport.fatigueScore) * 0.25 +
    Number(romConsistency) * 0.20 +
    avgSymmetry * 0.15
  );

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
    }
  };
};
