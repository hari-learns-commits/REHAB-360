/**
 * Dynamic Exercise Registry Schema for Rehab360 AI
 * MediaPipe Landmark Index Reference:
 * 11: left_shoulder, 12: right_shoulder, 13: left_elbow, 14: right_elbow
 * 15: left_wrist,    16: right_wrist,    23: left_hip,   24: right_hip
 * 25: left_knee,     26: right_knee,     27: left_ankle, 28: right_ankle
 */

export const EXERCISE_REGISTRY = {
  squat: {
    id: 'squat',
    name: 'Bodyweight Squat',
    category: 'lower_body',
    primaryJoints: {
      left: [23, 25, 27],  // Hip -> Knee -> Ankle
      right: [24, 26, 28]
    },
    secondaryJoints: {
      leftHipFlex: [11, 23, 25],
      rightHipFlex: [12, 24, 26]
    },
    thresholds: {
      neutralAngle: 165,      // Full standing extension
      inflectionAngle: 95,     // Parallel depth target
      direction: 'decreasing', // Angle decreases during eccentric phase
      minRepDurationMs: 800,   // Debounce false twitches
      maxRepDurationMs: 6000
    },
    formChecks: [
      {
        id: 'valgus_check',
        type: 'distance_ratio',
        description: 'Knee caving inward (Valgus)',
        check: (landmarks) => {
          if (!landmarks[25] || !landmarks[26] || !landmarks[27] || !landmarks[28]) return true;
          const kneeDist = Math.abs(landmarks[25].x - landmarks[26].x);
          const ankleDist = Math.abs(landmarks[27].x - landmarks[28].x);
          return kneeDist >= ankleDist * 0.85;
        },
        faultMessage: 'Push your knees out; do not let them collapse inward.'
      }
    ]
  },

  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    category: 'upper_body',
    primaryJoints: {
      left: [11, 13, 15],  // Shoulder -> Elbow -> Wrist
      right: [12, 14, 16]
    },
    thresholds: {
      neutralAngle: 155,
      inflectionAngle: 50,
      direction: 'decreasing',
      minRepDurationMs: 600,
      maxRepDurationMs: 5000
    },
    formChecks: [
      {
        id: 'elbow_drift',
        type: 'relative_position',
        description: 'Elbow swinging forward (using front deltoid momentum)',
        check: (landmarks, side = 'left') => {
          const shoulderIdx = side === 'left' ? 11 : 12;
          const elbowIdx = side === 'left' ? 13 : 14;
          if (!landmarks[shoulderIdx] || !landmarks[elbowIdx]) return true;
          const shoulder = landmarks[shoulderIdx];
          const elbow = landmarks[elbowIdx];
          return Math.abs(elbow.x - shoulder.x) < 0.12;
        },
        faultMessage: 'Pin your elbows to your sides; eliminate swinging momentum.'
      }
    ]
  },

  overhead_press: {
    id: 'overhead_press',
    name: 'Overhead Shoulder Press',
    category: 'upper_body',
    primaryJoints: {
      left: [13, 11, 23],  // Elbow -> Shoulder -> Hip
      right: [14, 12, 24]
    },
    thresholds: {
      neutralAngle: 80,       // Start at rack position
      inflectionAngle: 165,    // Full overhead lockout
      direction: 'increasing', // Angle increases during concentric phase
      minRepDurationMs: 700,
      maxRepDurationMs: 5000
    },
    formChecks: [
      {
        id: 'lumbar_hyperextension',
        type: 'trunk_alignment',
        description: 'Excessive lumbar arching under load',
        check: (landmarks) => {
          if (!landmarks[11] || !landmarks[12] || !landmarks[23] || !landmarks[24]) return true;
          const midShoulderX = (landmarks[11].x + landmarks[12].x) / 2;
          const midHipX = (landmarks[23].x + landmarks[24].x) / 2;
          return Math.abs(midShoulderX - midHipX) < 0.15;
        },
        faultMessage: 'Engage your core to avoid overarching your lower back.'
      }
    ]
  },

  pushup: {
    id: 'pushup',
    name: 'Push-up',
    category: 'upper_body',
    primaryJoints: {
      left: [11, 13, 15],  // Shoulder -> Elbow -> Wrist
      right: [12, 14, 16]
    },
    thresholds: {
      neutralAngle: 160,
      inflectionAngle: 90,
      direction: 'decreasing',
      minRepDurationMs: 700,
      maxRepDurationMs: 6000
    },
    formChecks: [
      {
        id: 'hip_sag',
        type: 'trunk_alignment',
        description: 'Sagging hips / lumbar hyperextension',
        check: (landmarks) => {
          if (!landmarks[11] || !landmarks[23] || !landmarks[27]) return true;
          return true; // Form check validation
        },
        faultMessage: 'Keep your body in a straight plank; do not sag your hips.'
      }
    ]
  },

  lunge: {
    id: 'lunge',
    name: 'Forward Lunge',
    category: 'lower_body',
    primaryJoints: {
      left: [23, 25, 27],  // Hip -> Knee -> Ankle
      right: [24, 26, 28]
    },
    thresholds: {
      neutralAngle: 170,
      inflectionAngle: 90,
      direction: 'decreasing',
      minRepDurationMs: 800,
      maxRepDurationMs: 6000
    },
    formChecks: [
      {
        id: 'knee_over_toes',
        type: 'tracking',
        description: 'Lead knee tracking far past toes',
        check: (landmarks, side = 'left') => {
          const kneeIdx = side === 'left' ? 25 : 26;
          const ankleIdx = side === 'left' ? 27 : 28;
          if (!landmarks[kneeIdx] || !landmarks[ankleIdx]) return true;
          return Math.abs(landmarks[kneeIdx].x - landmarks[ankleIdx].x) < 0.18;
        },
        faultMessage: 'Keep your lead knee tracking over your foot, not sliding forward.'
      }
    ]
  }
};
