/**
 * Kinematic Engine & Biomechanical Signal Processing
 *
 * Implements:
 * 1. Vector Inner Product Trigonometry for 2D/3D Joint Angles (Legs & Arms)
 * 2. Exponential Moving Average (EMA) Low-Pass Filter for Optical Jitter Suppression
 * 3. Granular Hand, Palm, and 21 Finger Joint Landmark Analytics
 * 4. Clinical Compensatory Fault Detection & Motion Phase State Machine
 * 5. Stateful Rep Counter with Hysteresis (ExerciseRepTracker)
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
 * Calculates 2D angle between three landmarks: A (proximal), B (vertex), C (distal)
 */
export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 180;
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Calculates joint angle using vector inner product (dot product inverse cosine)
 */
export const calculateJointAngle = (p1, p2, p3) => {
  if (!p1 || !p2 || !p3) return 170;

  const v1 = {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
    z: (p1.z || 0) - (p2.z || 0)
  };

  const v2 = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
    z: (p3.z || 0) - (p2.z || 0)
  };

  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 === 0 || mag2 === 0) return 170;

  const cosTheta = Math.max(-1.0, Math.min(1.0, dotProduct / (mag1 * mag2)));
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180.0) / Math.PI;

  return Math.round(angleDeg);
};

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

  const leftElbowAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);
  const leftShoulderAbduction = calculateJointAngle(leftHip, leftShoulder, leftElbow);
  const rightShoulderAbduction = calculateJointAngle(rightHip, rightShoulder, rightElbow);

  return { leftElbowAngle, rightElbowAngle, leftShoulderAbduction, rightShoulderAbduction };
};

export const calculateHandMetrics = (handLandmarks) => {
  if (!handLandmarks || handLandmarks.length < 21) {
    return { pinchDistance: 0.12, gripState: 'Open Palm', fingerExtensionRatio: 0.85 };
  }

  const thumbTip = handLandmarks[4];
  const indexTip = handLandmarks[8];
  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;
  const pinchDistance = Number(Math.sqrt(dx * dx + dy * dy).toFixed(3));

  let gripState = 'Open Palm';
  if (pinchDistance < 0.045) {
    gripState = 'Pinch Grip';
  } else {
    const wrist = handLandmarks[0];
    const middleMCP = handLandmarks[9];
    const middleTip = handLandmarks[12];
    const dWristMCP = Math.sqrt(Math.pow(middleMCP.x - wrist.x, 2) + Math.pow(middleMCP.y - wrist.y, 2));
    const dTipMCP = Math.sqrt(Math.pow(middleTip.x - middleMCP.x, 2) + Math.pow(middleTip.y - middleMCP.y, 2));
    if (dTipMCP < dWristMCP * 0.45) {
      gripState = 'Closed Fist';
    }
  }

  return { pinchDistance, gripState, fingerExtensionRatio: pinchDistance > 0.08 ? 0.9 : 0.4 };
};

export const applyEMAFilter = (currentVal, prevEMARef, alpha = 0.35) => {
  if (prevEMARef.current === null || prevEMARef.current === undefined) {
    prevEMARef.current = currentVal;
    return currentVal;
  }
  const smoothed = alpha * currentVal + (1 - alpha) * prevEMARef.current;
  prevEMARef.current = smoothed;
  return Number(smoothed.toFixed(1));
};

export const calculateValgusDeviation = (hip, knee, ankle) => {
  if (!hip || !knee || !ankle) return 2.0;
  const num = Math.abs((ankle.x - hip.x) * (hip.y - knee.y) - (hip.x - knee.x) * (ankle.y - hip.y));
  const den = Math.sqrt(Math.pow(ankle.x - hip.x, 2) + Math.pow(ankle.y - hip.y, 2));
  if (den === 0) return 2.0;

  const valgusVal = (num / den) * 100;
  return Number(Math.min(9.9, Math.max(0.4, valgusVal)).toFixed(1));
};

export const evaluateCompensatoryFaults = (landmarks, leftKneeAngle, rightKneeAngle, valgusOffset) => {
  const flags = [];
  let safetyStatus = 'safe';

  if (!landmarks || landmarks.length < 33) {
    return { safetyStatus: 'safe', flags: [], feedback: 'Position body clearly within camera view' };
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

/**
 * Stateful Rep Counter with Hysteresis
 */
export class ExerciseRepTracker {
  constructor(config) {
    this.name = config.name || config.id;
    this.thresholds = config.thresholds || {
      neutralAngle: 165,
      inflectionAngle: 95,
      direction: 'decreasing',
      minRepDurationMs: 800,
      maxRepDurationMs: 6000
    };
    this.primaryJoints = config.primaryJoints || { left: [23, 25, 27], right: [24, 26, 28] };
    this.formChecks = config.formChecks || [];
    
    this.stage = 'up';
    this.repCount = 0;
    this.repDurations = [];
    this.currentRepStartTime = null;
    this.minAngleReached = 180;
    this.maxAngleReached = 0;
    this.formErrors = [];
  }

  processFrame(landmarks, timestamp = Date.now()) {
    if (!landmarks || landmarks.length < 33) {
      return { repCount: this.repCount, stage: this.stage, status: 'low_visibility' };
    }

    const leftConf = ((landmarks[this.primaryJoints.left[0]]?.visibility || 0.8) + (landmarks[this.primaryJoints.left[1]]?.visibility || 0.8)) / 2;
    const rightConf = ((landmarks[this.primaryJoints.right[0]]?.visibility || 0.8) + (landmarks[this.primaryJoints.right[1]]?.visibility || 0.8)) / 2;
    const targetJoints = leftConf >= rightConf ? this.primaryJoints.left : this.primaryJoints.right;
    const activeSide = leftConf >= rightConf ? 'left' : 'right';

    const p1 = landmarks[targetJoints[0]];
    const p2 = landmarks[targetJoints[1]];
    const p3 = landmarks[targetJoints[2]];

    if (!p1 || !p2 || !p3 || (p1.visibility < 0.5 && p2.visibility < 0.5)) {
      return { repCount: this.repCount, stage: this.stage, status: 'low_visibility' };
    }

    const currentAngle = calculateAngle(p1, p2, p3);
    this.minAngleReached = Math.min(this.minAngleReached, currentAngle);
    this.maxAngleReached = Math.max(this.maxAngleReached, currentAngle);

    const isDecreasing = this.thresholds.direction === 'decreasing';

    // Evaluate Form Faults
    let faultDetected = null;
    for (const check of this.formChecks) {
      if (check.check && !check.check(landmarks, activeSide)) {
        faultDetected = check.faultMessage;
        break;
      }
    }

    // State Machine Transitions
    if (this.stage === 'up') {
      const reachedInflection = isDecreasing
        ? currentAngle <= this.thresholds.inflectionAngle
        : currentAngle >= this.thresholds.inflectionAngle;

      if (reachedInflection) {
        this.stage = 'down';
        this.currentRepStartTime = timestamp;
      }
    }

    if (this.stage === 'down') {
      const returnedToNeutral = isDecreasing
        ? currentAngle >= this.thresholds.neutralAngle
        : currentAngle <= this.thresholds.neutralAngle;

      if (returnedToNeutral) {
        const durationMs = timestamp - (this.currentRepStartTime || timestamp);

        if (durationMs >= this.thresholds.minRepDurationMs && durationMs <= this.thresholds.maxRepDurationMs) {
          this.repCount += 1;
          const durationSec = Number((durationMs / 1000).toFixed(2));
          this.repDurations.push(durationSec);

          const peakAngle = isDecreasing ? this.minAngleReached : this.maxAngleReached;
          this.minAngleReached = 180;
          this.maxAngleReached = 0;
          this.stage = 'up';

          return {
            repCount: this.repCount,
            stage: this.stage,
            repCompleted: true,
            faultDetected,
            metrics: {
              durationSec,
              durationMs,
              peakAngle,
              currentAngle
            }
          };
        }

        this.stage = 'up';
        this.minAngleReached = 180;
        this.maxAngleReached = 0;
      }
    }

    return {
      repCount: this.repCount,
      stage: this.stage,
      currentAngle,
      faultDetected,
      repCompleted: false
    };
  }
}
