import React, { useState, useRef } from 'react';
import { processWorkoutEndEndpoint } from '../services/aiReadinessService';
import { Video, Camera, CheckCircle2, AlertTriangle, Activity, Award, ShieldCheck, RefreshCw, X, Play } from 'lucide-react';

const WorkoutCompletionModal = ({ isOpen, onClose, athlete, plan, onCompleted }) => {
  const [step, setStep] = useState('record'); // 'record' | 'submitting' | 'result'
  const [videoSource, setVideoSource] = useState('webcam'); // 'webcam' | 'sample'
  const [videoFileUrl, setVideoFileUrl] = useState('blob:simulated-webcam-recording-proof-session.mp4');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Form metrics
  const [painScore, setPainScore] = useState(2);
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [notes, setNotes] = useState('');
  
  // AI Endpoint Result
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const timerRef = useRef(null);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setVideoFileUrl(`blob:session-recording-${Date.now()}.mp4`);
    }
  };

  const handleTriggerEndpoint = () => {
    if (!videoFileUrl) {
      setErrorMsg("Video Proof is Compulsory! Please record or select your session video proof.");
      return;
    }

    setErrorMsg(null);
    setStep('submitting');

    // Simulate API network call to Endpoint
    setTimeout(() => {
      try {
        const payload = {
          athleteId: athlete?.id || "ATH-202",
          athleteName: athlete?.name || "Alex Morgan",
          doctorId: athlete?.assignedDoctorId || "DOC-101",
          doctorName: athlete?.assignedDoctorName || "Dr. Valli",
          injuryId: plan?.injuryId || "KNEE_001",
          completedExercises: plan?.exercises || [],
          videoProofUrl: videoFileUrl,
          painScore: Number(painScore),
          fatigueLevel: Number(fatigueLevel),
          notes
        };

        const result = processWorkoutEndEndpoint(payload);
        setAiResult(result);
        setStep('result');
        if (onCompleted) onCompleted(result);
      } catch (err) {
        setErrorMsg(err.message || "Failed to process AI readiness endpoint.");
        setStep('record');
      }
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 15, 30, 0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card flex flex-col" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        padding: 0,
        overflow: 'hidden',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 2rem',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent-green))',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              color: '#fff'
            }}>
              <Video size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">End Workout & Log Compulsory Video Proof</h2>
              <p className="text-xs text-muted" style={{ color: '#94a3b8' }}>
                Prescribed by: <strong>{plan?.doctorName || 'Dr. Valli'}</strong> | AI Recovery & Readiness Evaluation
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        {step === 'record' && (
          <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', fontSize: '0.875rem' }}>
                <AlertTriangle size={16} inline style={{ marginRight: '6px' }} /> {errorMsg}
              </div>
            )}

            {/* Compulsory Video Proof Section */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-main flex items-center gap-2">
                  <Camera size={18} color="var(--primary)" /> Compulsory Video Proof Log
                  <span style={{ fontSize: '0.7rem', background: 'var(--danger)', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>Required</span>
                </h4>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setVideoSource('webcam')}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      border: 'none',
                      background: videoSource === 'webcam' ? 'var(--primary)' : '#e2e8f0',
                      color: videoSource === 'webcam' ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    Live Camera Feed
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVideoSource('sample')}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      border: 'none',
                      background: videoSource === 'sample' ? 'var(--primary)' : '#e2e8f0',
                      color: videoSource === 'sample' ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    Use Recorded Proof
                  </button>
                </div>
              </div>

              <div style={{
                height: '240px',
                background: '#090d16',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: isRecording ? '2px solid var(--danger)' : '1px solid #334155'
              }}>
                {/* Live Camera Simulation / Pose Overlay */}
                <div className="text-center" style={{ color: '#fff' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Video size={36} color="var(--primary)" />
                  </div>
                  <p className="font-bold text-sm">
                    {isRecording ? `Recording Session Video Proof (${recordingTime}s)` : 'Camera Feed Ready for Motion Capture'}
                  </p>
                  <p className="text-xs text-muted" style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                    MediaPipe Joint Pose Grid Activated • Angle Tracking ON
                  </p>
                </div>

                {isRecording && (
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'ping 1s infinite' }}></span>
                    REC {recordingTime}s
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: '12px' }}>
                  <button 
                    type="button" 
                    onClick={toggleRecording}
                    className="btn-primary" 
                    style={{
                      background: isRecording ? 'var(--danger)' : 'var(--primary)',
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    {isRecording ? 'Stop Recording Proof' : 'Start Camera Recording'}
                  </button>
                </div>
              </div>
            </div>

            {/* Self-Reported Session Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="text-xs font-bold text-muted block mb-1">
                  Post-Workout Joint Pain Level (0 - 10): <strong className="text-primary">{painScore} / 10</strong>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={painScore} 
                  onChange={(e) => setPainScore(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>0 (No Pain)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="text-xs font-bold text-muted block mb-1">
                  Perceived Exertion / Fatigue (1 - 10): <strong className="text-primary">{fatigueLevel} / 10</strong>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={fatigueLevel} 
                  onChange={(e) => setFatigueLevel(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>1 (Light)</span>
                  <span>5 (Hard)</span>
                  <span>10 (Exhausting)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Athlete Notes / Symptom Observations</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Felt slight tightness in set 2 of squats, otherwise no instability."
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
              <button type="button" onClick={handleTriggerEndpoint} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <CheckCircle2 size={18} /> Submit Workout & Process AI Readiness Endpoint
              </button>
            </div>
          </div>
        )}

        {/* Loading / Submitting State */}
        {step === 'submitting' && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={48} className="animate-spin text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Analyzing Video Proof & Processing AI Endpoint...</h3>
            <p className="text-sm text-muted" style={{ maxWidth: '500px' }}>
              Extracting joint angles, knee valgus collapse parameters, movement symmetry, and evaluating readiness for return-to-play.
            </p>
          </div>
        )}

        {/* Step 3: AI Analysis & Readiness Verdict Screen */}
        {step === 'result' && aiResult && (
          <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Outcome & Readiness Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              textAlign: 'center',
              border: `2px solid ${aiResult.readinessBadgeColor}`
            }}>
              <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                <span style={{
                  background: aiResult.readinessBadgeColor,
                  color: '#ffffff',
                  padding: '0.4rem 1.25rem',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {aiResult.readinessBadgeText}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mt-2">
                Outcome: {aiResult.hasRecovered ? "Athlete Recovered & Functionally Cleared" : "Ongoing Rehabilitation Protocol"}
              </h3>
              
              <p className="text-sm mt-1" style={{ color: '#cbd5e1' }}>
                Assigned Specialist: <strong>{aiResult.doctorName}</strong> | Session ID: <code>{aiResult.sessionId}</code>
              </p>
            </div>

            {/* Core Readiness Status Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p className="text-xs text-muted mb-1">Kinetic Symmetry</p>
                <h3 className="text-2xl font-bold text-primary">{aiResult.metrics.movementSymmetryPercent}%</h3>
                <span className="text-xs text-muted">Video Pose Score</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p className="text-xs text-muted mb-1">Joint Valgus Wobble</p>
                <h3 className="text-2xl font-bold" style={{ color: aiResult.metrics.valgusAngleDeviation < 5 ? 'var(--success)' : 'var(--danger)' }}>
                  {aiResult.metrics.valgusAngleDeviation}°
                </h3>
                <span className="text-xs text-muted">Lateral Deviation</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p className="text-xs text-muted mb-1">Post Pain Score</p>
                <h3 className="text-2xl font-bold" style={{ color: aiResult.metrics.painScore <= 2 ? 'var(--success)' : 'var(--danger)' }}>
                  {aiResult.metrics.painScore} / 10
                </h3>
                <span className="text-xs text-muted">Self-Reported</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p className="text-xs text-muted mb-1">Plan Adherence</p>
                <h3 className="text-2xl font-bold text-primary">{aiResult.metrics.adherenceRatePercent}%</h3>
                <span className="text-xs text-muted">Doctor Prescribed</span>
              </div>
            </div>

            {/* Detailed AI Diagnostic Report */}
            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${aiResult.readinessBadgeColor}` }}>
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-main">
                <Activity size={18} color="var(--primary)" /> AI Biomechanical & Readiness Synthesis
              </h4>
              <p className="text-sm text-muted mb-3" style={{ lineHeight: 1.6 }}>
                {aiResult.aiReport.summary}
              </p>
              <div className="text-xs text-muted flex flex-col gap-1" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div><strong>Video AI Diagnostics:</strong> {aiResult.aiReport.biomechanicalFeedback}</div>
                <div><strong>Clinical Directive:</strong> {aiResult.aiReport.nextSteps}</div>
              </div>
            </div>

            {/* Video Proof Confirmation Card */}
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--success)', padding: '0.4rem', borderRadius: '50%', color: '#fff' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Compulsory Video Proof Verified</h5>
                  <p className="text-xs text-muted">Video proof logged & synchronized to Dr. {aiResult.doctorName}'s clinical portal.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={onClose}
                className="btn-primary" 
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCompletionModal;
