-- Production-Grade PostgreSQL and Supabase Schema Architecture for Rehab360 AI

-- Enable cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Standardized Injury Taxonomy (Orchard OSIICS v11 / OSICS v10)
CREATE TABLE IF NOT EXISTS public.injury_taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  body_region VARCHAR(50) NOT NULL,
  tissue_type VARCHAR(50) NOT NULL,
  pathology VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Stage-Gated Clinical Protocols (e.g., Melbourne ACL Protocol 2.0)
CREATE TABLE IF NOT EXISTS public.clinical_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  injury_taxonomy_id UUID REFERENCES public.injury_taxonomies(id) ON DELETE RESTRICT,
  phase_number INT NOT NULL,
  phase_name VARCHAR(100) NOT NULL,
  min_recommended_weeks INT NOT NULL,
  clearance_criteria JSONB NOT NULL,
  contraindications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(injury_taxonomy_id, phase_number)
);

-- 3. Core User and Patient Profile Mapping
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('athlete', 'physiotherapist', 'orthopedic_surgeon')),
  assigned_physio_id UUID REFERENCES public.patient_profiles(id),
  assigned_ortho_id UUID REFERENCES public.patient_profiles(id),
  active_injury_id UUID REFERENCES public.injury_taxonomies(id),
  current_rehab_phase INT DEFAULT 1,
  surgery_date DATE,
  affected_side VARCHAR(10) CHECK (affected_side IN ('left', 'right', 'bilateral')),
  baseline_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Prescribed Workout & Exercise Regimens
CREATE TABLE IF NOT EXISTS public.rehabilitation_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  prescribed_by UUID NOT NULL REFERENCES public.patient_profiles(id),
  exercise_name VARCHAR(100) NOT NULL,
  target_sets INT NOT NULL CHECK (target_sets > 0),
  target_reps INT NOT NULL CHECK (target_reps > 0),
  min_rom_degrees NUMERIC(5, 2) NOT NULL,
  max_rom_degrees NUMERIC(5, 2),
  max_valgus_angle_allowed NUMERIC(5, 2) DEFAULT 10.0,
  gemini_clinical_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Rehabilitation Exercise Telemetry Sessions
CREATE TABLE IF NOT EXISTS public.rehabilitation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.rehabilitation_prescriptions(id),
  exercise_name VARCHAR(100) NOT NULL,
  start_timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  end_timestamp TIMESTAMPTZ,
  total_reps_completed INT DEFAULT 0,
  valid_reps_count INT DEFAULT 0,
  mean_symmetry_index NUMERIC(5, 2),
  peak_angular_velocity NUMERIC(7, 2),
  mean_rom_achieved NUMERIC(5, 2),
  form_flaw_count INT DEFAULT 0,
  video_recording_url TEXT,
  session_status VARCHAR(20) DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'aborted'))
);

-- 6. High-Frequency Frame-by-Frame Kinematic Telemetry
CREATE TABLE IF NOT EXISTS public.session_telemetry_frames (
  id BIGSERIAL,
  session_id UUID NOT NULL REFERENCES public.rehabilitation_sessions(id) ON DELETE CASCADE,
  timestamp_offset_ms INT NOT NULL,
  rep_index INT NOT NULL DEFAULT 0,
  rep_phase VARCHAR(20) CHECK (rep_phase IN ('eccentric', 'concentric', 'isometric', 'rest')),
  joint_angles JSONB NOT NULL,
  angular_velocities JSONB NOT NULL,
  flaws_detected TEXT[] DEFAULT '{}',
  normalized_landmarks JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  PRIMARY KEY (session_id, timestamp_offset_ms)
);

-- 7. Daily Readiness and Load Monitoring
CREATE TABLE IF NOT EXISTS public.daily_readiness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  readiness_score NUMERIC(5, 2) NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
  resting_hrv_rmssd NUMERIC(6, 2) NOT NULL,
  sleep_hours NUMERIC(4, 2) NOT NULL,
  muscle_soreness_score INT CHECK (muscle_soreness_score BETWEEN 0 AND 10),
  rpe_score INT CHECK (rpe_score BETWEEN 0 AND 10),
  calculated_acwr NUMERIC(4, 2),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(patient_id, log_date)
);

-- Indexing & Concurrency Optimizations
CREATE INDEX IF NOT EXISTS idx_patient_active_injury ON public.patient_profiles(active_injury_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_time ON public.rehabilitation_sessions(patient_id, start_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_patient_date ON public.daily_readiness_logs(patient_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.rehabilitation_prescriptions(patient_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_telemetry_playback ON public.session_telemetry_frames(session_id, timestamp_offset_ms ASC);

-- Row-Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehabilitation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_telemetry_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehabilitation_prescriptions ENABLE ROW LEVEL SECURITY;
