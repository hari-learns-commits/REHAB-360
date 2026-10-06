import { Link } from 'react-router-dom';
import { Activity, Stethoscope, Video, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '3.5rem 1rem 3rem 1rem',
          maxWidth: '960px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
          <span
            style={{
              background: 'var(--strava-orange-light)',
              color: 'var(--strava-orange)',
              padding: '0.4rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: '1px solid var(--strava-orange-border)'
            }}
          >
            REHAB360 • CLINICAL AI PLATFORM
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-dark" style={{ lineHeight: 1.2 }}>
          Doctor-Directed Rehabilitation & <span style={{ color: 'var(--strava-orange)' }}>Compulsory Video Proof</span> AI
        </h1>

        <p className="text-base md:text-lg text-muted mb-8" style={{ lineHeight: 1.65, maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          Empowering orthopedic doctors and physiotherapists to prescribe customized exercise protocols while athletes submit compulsory video proof for computer vision pose tracking and kinetic readiness verdicts.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/athlete" className="btn-strava" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <Activity size={20} /> Athlete Portal <ArrowRight size={16} />
          </Link>
          <Link to="/physio" className="btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <Stethoscope size={20} /> Physio Dashboard
          </Link>
        </div>
      </section>

      {/* 3 Strava Feature Pillars */}
      <section style={{ padding: '2rem 0' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="strava-card flex flex-col items-start p-6">
            <div
              style={{
                padding: '0.85rem',
                background: 'var(--strava-orange-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--strava-orange)',
                marginBottom: '1.25rem'
              }}
            >
              <Stethoscope size={28} />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">1. Doctor-Directed Prescriptions</h3>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
              Workout plans are authored directly by assigned doctors and physical therapists to enforce strict clinical compliance.
            </p>
          </div>

          <div className="strava-card flex flex-col items-start p-6">
            <div
              style={{
                padding: '0.85rem',
                background: 'var(--strava-orange-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--strava-orange)',
                marginBottom: '1.25rem'
              }}
            >
              <Video size={28} />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">2. Compulsory Video Proof</h3>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
              Athletes log workout completion with mandatory video recording proof for real-time joint angle estimation and motion analysis.
            </p>
          </div>

          <div className="strava-card flex flex-col items-start p-6">
            <div
              style={{
                padding: '0.85rem',
                background: 'var(--strava-orange-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--strava-orange)',
                marginBottom: '1.25rem'
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">3. AI Readiness Verdicts</h3>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
              Generates automated readiness statuses: <em>Ready to Compete</em>, <em>Fit to Play</em>, or <em>Ready to Practice</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Box */}
      <section style={{ padding: '2rem 0' }}>
        <div className="strava-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-strava uppercase mb-2 block" style={{ letterSpacing: '0.05em' }}>
                CLINICAL EXCELLENCE
              </span>
              <h2 className="text-2xl font-bold text-dark mb-4" style={{ lineHeight: 1.3 }}>
                Data-Driven Recovery Built For Sports Medicine
              </h2>
              <ul className="flex flex-col gap-3 text-sm text-muted">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} color="var(--strava-orange)" /> Direct Doctor-to-Athlete prescription mapping
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} color="var(--strava-orange)" /> MediaPipe joint angle tracking & valgus wobble detection
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} color="var(--strava-orange)" /> Automated readiness score & clinical clearance workflow
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80"
                alt="Athlete Recovery"
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
