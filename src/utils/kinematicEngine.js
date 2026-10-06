/**
 * Kinematic Engine & Biomechanical Signal Processing
 *
 * Implements:
 * 1. Vector Inner Product Trigonometry for 2D/3D Joint Angles (Legs & Arms)
 * 2. Exponential Moving Average (EMA) Low-Pass Filter for Optical Jitter Suppression
 * 3. Granular Hand, Palm, and 21 Finger Joint Landmark Analytics
 * 4. Clinical Compensatory Fault Detection & Motion Phase State Machine
 */

/**
 * Standard MediaPipe Hand 21 Landmark Connections Topology
 */
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20],// Pinky finger
  [5, 9], [9, 13], [13, 17]             // Palm base cross-connectors
];

/**
 * Calculates joint angle using vector inner product (dot product inverse cosine)
 * @param {{x: number, y: number, z?: number}} p1 - First landmark (e.g., Hip or Shoulder)
 * @param {{x: number, y: number, z?: number}} p2 - Vertex landmark (e.g., Knee or Elbow)
 * @param {{x: number, y: number, z?: number}} p3 - Terminal landmark (e.g., Ankle or Wrist)
 * @returns {number} Angle in degrees [0 - 180]
 */
export const calculateJointAngle = (p1, p2, p3) => {
  if (!p1 || !p2 || !p3) return 170;

  // Vector 1 (Vertex -> p1)
  const v1 = {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
    z: (p1.z || 0) - (p2.z || 0)
  };

  // Vector 2 (Vertex -> p3)
  const v2 = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
    z: (p3.z || 0) - (p2.z || 0)
  };

  // Dot product v1 . v2
  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

  // Vector Magnitudes |v1| and |v2|
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 === 0 || mag2 === 0) return 170;

  // Cosine theta clamped to [-1, 1] for numerical precision
  const cosTheta = Math.max(-1.0, Math.min(1.0, dotProduct / (mag1 * mag2)));
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180.0) / Math.PI;

  return Math.round(angleDeg);
};

/**
 * Calculates upper extremity arm kinematics (Elbow Flexion & Shoulder Abduction)
 * @param {Array<{x: number, y: number, z?: number}>} landmarks - 33 Pose Landmarks
 * @returns {{leftElbowAngle: number, rightElbowAngle: number, leftShoulderAbduction: number, rightShoulderAbduction: number}}
 */
export const calculateArmAngles = (landmarks) => {
  if (!landmarks || landmarks.length < 33) {
    return { leftElbowAngle: 160, rightElbowAngle: 160, leftShoulderAbduction: 25, rightShoulderAbduction: 25 };
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Elbow Flexion Angles (Shoulder - Elbow - Wrist)
  const leftElbowAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);

  // Shoulder Abduction Angles (Hip - Shoulder - Elbow)
  const leftShoulderAbduction = calculateJointAngle(leftHip, leftShoulder, leftElbow);
  const rightShoulderAbduction = calculateJointAngle(rightHip, rightShoulder, rightElbow);

  return { leftElbowAngle, rightElbowAngle, leftShoulderAbduction, rightShoulderAbduction };
};

/**
 * Calculates hand & finger metrics from 21 hand landmarks
 * @param {Array<{x: number, y: number, z?: number}>} handLandmarks - 21 Hand Landmarks
 * @returns {{pinchDistance: number, gripState: 'Open Palm'|'Pinch Grip'|'Closed Fist', fingerExtensionRatio: number}}
 */
export const calculateHandMetrics = (handLandmarks) => {
  if (!handLandmarks || handLandmarks.length < 21) {
    return { pinchDistance: 0.12, gripState: 'Open Palm', fingerExtensionRatio: 0.85 };
  }

  const wrist = handLandmarks[0];
  const thumbTip = handLandmarks[4];
  const indexTip = handLandmarks[8];
  const middleTip = handLandmarks[12];
  const ringTip = handLandmarks[16];
  const pinkyTip = handLandmarks[20];

  // Thumb to Index tip pinch distance
  const pinchDx = thumbTip.x - indexTip.x;
  const pinchDy = thumbTip.y - indexTip.y;
  const pinchDistance = Number(Math.sqrt(pinchDx * pinchDx + pinchDy * pinchDy).toFixed(3));

  // Average distance from wrist to finger tips
  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  const avgDistToWrist = tips.reduce((acc, tip) => {
    const dx = tip.x - wrist.x;
    const dy = tip.y - wrist.y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0) / 4;

  let gripState = 'Open Palm';
  if (pinchDistance < 0.055) {
    gripState = 'Pinch Grip';
  } else if (avgDistToWrist < 0.22) {
    gripState = 'Closed Fist';
  }

  return {
    pinchDistance,
    gripState,
    fingerExtensionRatio: Number(avgDistToWrist.toFixed(2))
  };
};

/**
 * Exponential Moving Average (EMA) Low-Pass Filter
 * @param {number} rawAngle
 * @param {number|null} prevEMA
 * @param {number} alpha - Smoothing factor [0.20 - 0.35]
 * @returns {number} EMA smoothed angle
 */
export const applyEMAFilter = (rawAngle, prevEMA, alpha = 0.25) => {
  if (prevEMA === null || prevEMA === undefined || isNaN(prevEMA)) {
    return rawAngle;
  }
  const smoothed = alpha * rawAngle + (1 - alpha) * prevEMA;
  return Number(smoothed.toFixed(1));
};

/**
 * Calculates perpendicular knee valgus deviation offset
 */
export const calculateValgusDeviation = (hip, knee, ankle) => {
  if (!hip || !knee || !ankle) return 2.0;

  const num = Math.abs((ankle.x - hip.x) * (hip.y - knee.y) - (hip.x - knee.x) * (ankle.y - hip.y));
  const den = Math.sqrt(Math.pow(ankle.x - hip.x, 2) + Math.pow(ankle.y - hip.y, 2));
  if (den === 0) return 2.0;

  const valgusVal = (num / den) * 100;
  return Number(Math.min(9.9, Math.max(0.4, valgusVal)).toFixed(1));
};

/**
 * Evaluates clinical compensatory movement faults
 */
export const evaluateCompensatoryFaults = (landmarks, leftKneeAngle, rightKneeAngle, valgusOffset) => {
  const flags = [];
  let safetyStatus = 'safe';

  if (!landmarks || landmarks.length < 33) {
    return {
      safetyStatus: 'safe',
      flags: [],
      feedback: 'Position body clearly within camera view'
    };
  }

  const angleDiff = Math.abs(leftKneeAngle - rightKneeAngle);
  if (angleDiff > 14) {
    flags.push('asymmetrical_loading');
    safetyStatus = 'caution';
  }

  if (valgusOffset > 3.2) {
    flags.push('knee_valgus');
    safetyStatus = 'unsafe';
  }

  const leftShoulder = landmarks[11];
  const leftHip = landmarks[23];
  if (leftShoulder && leftHip) {
    const torsoDy = leftHip.y - leftShoulder.y;
    const torsoDx = Math.abs(leftHip.x - leftShoulder.x);
    const torsoLeanDeg = (Math.atan2(torsoDx, torsoDy) * 180.0) / Math.PI;
    if (torsoLeanDeg > 35) {
      flags.push('excessive_torso_lean');
      if (safetyStatus !== 'unsafe') safetyStatus = 'caution';
    }
  }

  let feedback = 'Good biomechanical alignment! Tracking arms, palms & fingers live.';
  if (flags.includes('knee_valgus')) {
    feedback = '⚠️ CAUTION: Knee caving inward (Valgus)! Push knees outward over 2nd toe.';
  } else if (flags.includes('asymmetrical_loading')) {
    feedback = '⚠️ WARNING: Shifting weight to one side! Equalize pressure on both feet.';
  } else if (flags.includes('excessive_torso_lean')) {
    feedback = '💡 Form Note: Keep chest lifted to prevent excessive forward torso lean.';
  }

  return { safetyStatus, flags, feedback };
};

/**
 * Motion State Machine: Detects exercise phase
 */
export const detectExercisePhase = (currentAngle, prevAngle, currentPhase) => {
  let phase = currentPhase || 'standing';
  let repIncrement = false;

  const delta = currentAngle - (prevAngle || currentAngle);

  if (currentAngle < 125) {
    if (Math.abs(delta) < 2) {
      phase = 'isometric';
    } else if (delta < -2) {
      phase = 'eccentric';
    } else if (delta > 2) {
      phase = 'concentric';
    }
  } else if (currentAngle > 155) {
    if (currentPhase === 'concentric' || currentPhase === 'eccentric' || currentPhase === 'isometric') {
      repIncrement = true;
    }
    phase = 'standing';
  } else {
    if (delta < -1.5) {
      phase = 'eccentric';
    } else if (delta > 1.5) {
      phase = 'concentric';
    }
  }

  return { phase, repIncrement };
};
