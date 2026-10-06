import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xyz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'ey...';

const supabase = createClient(supabaseUrl, supabaseKey);

const FRAME_RATE_HZ = 30;
const FRAME_STEP_MS = Math.round(1000 / FRAME_RATE_HZ);
const REPS_TO_SIMULATE = 5;
const SECONDS_PER_REP = 3.5;
const TOTAL_FRAMES_PER_REP = Math.round(SECONDS_PER_REP * FRAME_RATE_HZ);

function calculateKneeFlexion(t, isAffectedLimb, hasPathology) {
  const normalizedDepth = (1 - Math.cos(2 * Math.PI * t)) / 2;
  const targetDepthDeg = 95.0;
  let kneeAngle = 180.0 - (normalizedDepth * targetDepthDeg);

  if (isAffectedLimb && hasPathology) {
    kneeAngle += (15.0 * normalizedDepth); // Deficit in depth due to pathology
  }

  const noise = (Math.random() - 0.5) * 1.8;
  return Number((kneeAngle + noise).toFixed(2));
}

function calculateFrontalValgus(t, isAffectedLimb, hasPathology) {
  if (!isAffectedLimb || !hasPathology) return Number(((Math.random() - 0.5) * 2.0).toFixed(2));
  
  if (t >= 0.45 && t <= 0.65) {
    const valgusMagnitude = Math.sin((t - 0.45) * Math.PI / 0.2) * 14.5;
    return Number((valgusMagnitude + (Math.random() - 0.5) * 1.5).toFixed(2));
  }
  
  return Number(((Math.random() - 0.5) * 2.0).toFixed(2));
}

export async function generateSyntheticSession(patientId, hasPathology = true) {
  const sessionId = faker.string.uuid();
  const startTime = new Date();

  const sessionRecord = {
    id: sessionId,
    patient_id: patientId,
    exercise_name: 'Barbell Back Squat',
    start_timestamp: startTime.toISOString(),
    total_reps_completed: REPS_TO_SIMULATE,
    valid_reps_count: hasPathology ? REPS_TO_SIMULATE - 2 : REPS_TO_SIMULATE,
    mean_symmetry_index: hasPathology ? 78.4 : 96.1,
    peak_angular_velocity: 184.2,
    mean_rom_achieved: hasPathology ? 81.3 : 97.4,
    form_flaw_count: hasPathology ? 7 : 0,
    session_status: 'completed'
  };

  const { error: sessionError } = await supabase
    .from('rehabilitation_sessions')
    .insert(sessionRecord);

  if (sessionError) {
    console.warn('⚠️ Session Insert Note:', sessionError.message || sessionError);
  }

  const telemetryBatch = [];
  let currentOffsetMs = 0;

  for (let rep = 1; rep <= REPS_TO_SIMULATE; rep++) {
    for (let f = 0; f < TOTAL_FRAMES_PER_REP; f++) {
      const phaseT = f / TOTAL_FRAMES_PER_REP;
      currentOffsetMs += FRAME_STEP_MS;

      let phase = 'eccentric';
      if (phaseT > 0.45 && phaseT < 0.55) phase = 'isometric';
      else if (phaseT >= 0.55) phase = 'concentric';

      const leftKnee = calculateKneeFlexion(phaseT, true, hasPathology);
      const rightKnee = calculateKneeFlexion(phaseT, false, false);
      const leftValgus = calculateFrontalValgus(phaseT, true, hasPathology);

      const flaws = [];
      if (leftValgus > 10.0) flaws.push('DYNAMIC_KNEE_VALGUS');
      if (leftKnee > 115.0 && phase === 'isometric') flaws.push('INSUFFICIENT_DEPTH');

      const angularVelocity = Number((Math.abs(Math.sin(2 * Math.PI * phaseT)) * 140.0).toFixed(2));

      telemetryBatch.push({
        session_id: sessionId,
        timestamp_offset_ms: currentOffsetMs,
        rep_index: rep,
        rep_phase: phase,
        joint_angles: {
          left_knee: leftKnee,
          right_knee: rightKnee,
          left_valgus_angle: leftValgus,
          hip_flexion: Number((180 - (leftKnee * 0.65)).toFixed(2))
        },
        angular_velocities: {
          left_knee_deg_sec: angularVelocity
        },
        flaws_detected: flaws
      });
    }
  }

  const { error: framesError } = await supabase
    .from('session_telemetry_frames')
    .insert(telemetryBatch);

  if (framesError) {
    console.warn('⚠️ Telemetry Frames Insert Note:', framesError.message || framesError);
  }

  console.log(`✅ Seeded synthetic session ${sessionId} with ${telemetryBatch.length} telemetry frames!`);
  return sessionId;
}

async function runSeed() {
  console.log('🌱 Starting Rehab360 AI Database Seeding Routine...');
  const patientId = faker.string.uuid();
  await generateSyntheticSession(patientId, true);
  console.log('🎉 Seeding Complete!');
}

if (process.argv[1]?.includes('seedDatabase.js')) {
  runSeed();
}
