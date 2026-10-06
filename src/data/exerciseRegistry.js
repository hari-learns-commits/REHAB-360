// src/data/exerciseRegistry.js

// MediaPipe Landmark Index Reference:
// 11: left_shoulder, 12: right_shoulder, 13: left_elbow, 14: right_elbow
// 15: left_wrist,    16: right_wrist,    23: left_hip,   24: right_hip
// 25: left_knee,     26: right_knee,     27: left_ankle, 28: right_ankle

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
          const shIdx = side === 'left' ? 11 : 12;
          const elIdx = side === 'left' ? 13 : 14;
          if (!landmarks[shIdx] || !landmarks[elIdx]) return true;
          const shoulder = landmarks[shIdx];
          const elbow = landmarks[elIdx];
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
    name: 'Push-ups',
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
        description: 'Sagging hips or lumbar hyperextension',
        check: (landmarks) => {
          if (!landmarks[11] || !landmarks[23] || !landmarks[25]) return true;
          const sh = landmarks[11];
          const hp = landmarks[23];
          const kn = landmarks[25];
          const sagDev = Math.abs(hp.y - ((sh.y + kn.y) / 2));
          return sagDev < 0.10;
        },
        faultMessage: 'Keep hips aligned with shoulders; avoid hip sag.'
      }
    ]
  },

  lunge: {
    id: 'lunge',
    name: 'Forward / Reverse Lunges',
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
        id: 'knee_over_toe',
        type: 'knee_tracking',
        description: 'Front knee pushing past toes',
        check: (landmarks, side = 'left') => {
          const knIdx = side === 'left' ? 25 : 26;
          const ankIdx = side === 'left' ? 27 : 28;
          if (!landmarks[knIdx] || !landmarks[ankIdx]) return true;
          return Math.abs(landmarks[knIdx].x - landmarks[ankIdx].x) < 0.12;
        },
        faultMessage: 'Keep front knee behind toes during descent.'
      }
    ]
  }
};
