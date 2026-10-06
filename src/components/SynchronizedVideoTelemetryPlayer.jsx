import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Activity, Eye, Zap, CheckCircle2, Hand } from 'lucide-react';
import { HAND_CONNECTIONS } from '../utils/kinematicEngine';

const SynchronizedVideoTelemetryPlayer = ({
  videoUrl,
  telemetryData = [],
  sessionTitle = "Recorded Workout Video Proof & Telemetry",
  athleteName = "Alex Morgan",
  date = new Date().toLocaleDateString()
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [activeFrame, setActiveFrame] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Playback Speed Handler
  const handleSetSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek Handler
  const handleSeek = (e) => {
    const timeSec = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = timeSec;
      setCurrentTimeMs(timeSec * 1000);
    }
  };

  // Synchronized Render Loop matching video currentTime to telemetry time-series array
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');

    const updateFrame = () => {
      if (!video) return;

      const currMs = video.currentTime * 1000;
      setCurrentTimeMs(currMs);
      if (video.duration && !isNaN(video.duration)) {
        setDurationMs(video.duration * 1000);
      }

      const width = canvas.width || 640;
      const height = canvas.height || 420;
      ctx.clearRect(0, 0, width, height);

      // Find closest telemetry frame by timestamp offset
      let closestFrame = null;
      if (telemetryData && telemetryData.length > 0) {
        closestFrame = telemetryData.reduce((prev, curr) => {
          return Math.abs(curr.timestamp - currMs) < Math.abs(prev.timestamp - currMs) ? curr : prev;
        }, telemetryData[0]);
      }

      setActiveFrame(closestFrame);

      // Draw Telemetry Skeletal Mesh & Hand Nodes onto Canvas if Enabled
      if (showOverlay && closestFrame) {
        const angle = closestFrame.primary_angle || 160;
        const kneeFlexionRatio = Math.max(0, Math.min(1, (170 - angle) / 70));

        const cx = width / 2;
        const hipY = height * 0.42 + kneeFlexionRatio * 32;
        const kneeY = height * 0.65 + kneeFlexionRatio * 16;
        const ankleY = height * 0.85;

        // Overlay Grid
        ctx.strokeStyle = 'rgba(252, 76, 2, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Draw Left Leg (Orange)
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = closestFrame.safety_status === 'unsafe' ? '#ef4444' : '#fc4c02';

        ctx.beginPath();
        ctx.moveTo(cx - 35, hipY);
        ctx.lineTo(cx - 38 - (closestFrame.valgus_deviation > 3 ? 12 : 0), kneeY);
        ctx.lineTo(cx - 40, ankleY);
        ctx.stroke();

        // Draw Right Leg (Blue)
        ctx.strokeStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(cx + 35, hipY);
        ctx.lineTo(cx + 38 + (closestFrame.valgus_deviation > 3 ? 12 : 0), kneeY);
        ctx.lineTo(cx + 40, ankleY);
        ctx.stroke();

        // Draw Arm Vectors (Cyan)
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(cx - 35, height * 0.28);
        ctx.lineTo(cx - 65, height * 0.42);
        ctx.lineTo(cx - 85, height * 0.38);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + 35, height * 0.28);
        ctx.lineTo(cx + 65, height * 0.42);
        ctx.lineTo(cx + 85, height * 0.38);
        ctx.stroke();

        // Draw Simulated Hand 21 Finger Joints at Wrist Endpoints
        [
          { x: cx - 85, y: height * 0.38, color: '#06b6d4' },
          { x: cx + 85, y: height * 0.38, color: '#10b981' }
        ].forEach((hand) => {
          // Hand Base & 5 Finger Spread Lines
          ctx.strokeStyle = hand.color;
          ctx.lineWidth = 2;
          for (let f = -2; f <= 2; f++) {
            ctx.beginPath();
            ctx.moveTo(hand.x, hand.y);
            ctx.lineTo(hand.x + f * 6, hand.y - 14 + Math.abs(f) * 2);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hand.x + f * 6, hand.y - 14 + Math.abs(f) * 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Joint Nodes
        [
          { x: cx - 35, y: hipY },
          { x: cx - 38, y: kneeY },
          { x: cx - 40, y: ankleY },
          { x: cx + 35, y: hipY },
          { x: cx + 38, y: kneeY },
          { x: cx + 40, y: ankleY }
        ].forEach((pt) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();
        });

        // Angle Callout
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Inter", sans-serif';
        ctx.shadowColor = '#0f172a';
        ctx.shadowBlur = 4;
        ctx.fillText(`Knee: ${Math.round(angle)}°`, cx - 75, kneeY);
        ctx.fillText(`Arm L: ${activeFrame.left_elbow_angle || 155}°`, cx - 110, height * 0.35);
        ctx.shadowBlur = 0;
      }

      if (!video.paused && !video.ended) {
        animRef.current = requestAnimationFrame(updateFrame);
      }
    };

    if (isPlaying) {
      animRef.current = requestAnimationFrame(updateFrame);
    } else {
      updateFrame();
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, telemetryData, showOverlay]);

  // Extract Compensatory Warnings
  const currentFlags = activeFrame?.compensatory_flags || [];
  const currentSafety = activeFrame?.safety_status || 'safe';

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER CARD */}
      <div className="flex justify-between items-center flex-wrap gap-3 p-4" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
        <div>
          <span className="text-xs font-extrabold text-primary uppercase" style={{ letterSpacing: '0.05em' }}>
            CLINICAL HOLISTIC TIME-SERIES SYNCHRONIZED PLAYER
          </span>
          <h3 className="text-lg font-bold text-main">{sessionTitle}</h3>
          <span className="text-xs text-muted">Athlete: {athleteName} • Date: {date}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: currentSafety === 'unsafe' ? '#fef2f2' : currentSafety === 'caution' ? '#fff7ed' : '#f0fdf4',
              color: currentSafety === 'unsafe' ? '#ef4444' : currentSafety === 'caution' ? '#f59e0b' : '#16a34a',
              border: `1px solid ${currentSafety === 'unsafe' ? '#fca5a5' : currentSafety === 'caution' ? '#fed7aa' : '#bbf7d0'}`
            }}
          >
            STATUS: {currentSafety.toUpperCase()}
          </span>

          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="btn-outline"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.775rem' }}
          >
            <Eye size={14} /> {showOverlay ? "Hide Telemetry Mesh" : "Show Telemetry Mesh"}
          </button>
        </div>
      </div>

      {/* SYNCHRONIZED MEDIA CANVAS STACK */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#000000',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)'
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        <canvas
          ref={canvasRef}
          width={640}
          height={420}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />

        {/* REAL-TIME TELEMETRY OVERLAY HUD (LEGS, ARMS & HANDS) */}
        {activeFrame && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(252,76,2,0.4)', color: '#ffffff' }}>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Knee Flexion (EMA)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fc4c02' }}>{Math.round(activeFrame.primary_angle || 160)}°</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.4)', color: '#ffffff' }}>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Arm Elbow Flexion</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>L: {activeFrame.left_elbow_angle || 155}° | R: {activeFrame.right_elbow_angle || 157}°</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)', color: '#ffffff' }}>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Hand Grip / Palm</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{activeFrame.hand_grip_state || 'Open Palm'}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '8px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800 }}>
              ⏱ {(currentTimeMs / 1000).toFixed(2)}s / {durationMs > 0 ? (durationMs / 1000).toFixed(1) : 0}s
            </div>
          </div>
        )}

        {/* COMPENSATORY FAULT ALERTS BANNER */}
        {currentFlags.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(239, 68, 68, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
              pointerEvents: 'none'
            }}
          >
            <AlertTriangle size={20} color="#ffffff" />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                COMPENSATORY FAULT DETECTED AT {(currentTimeMs / 1000).toFixed(1)}s:
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {currentFlags.map((f) => f.replace('_', ' ').toUpperCase()).join(' • ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS DOCK */}
      <div className="flex flex-col gap-3 p-4" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {/* Scrubber Bar */}
        <input
          type="range"
          min="0"
          max={(durationMs / 1000) || 10}
          step="0.05"
          value={currentTimeMs / 1000}
          onChange={handleSeek}
          style={{ width: '100%', accentColor: '#fc4c02', cursor: 'pointer' }}
        />

        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="btn-primary"
              style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Playback Speed:</span>
            {[0.25, 0.5, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSetSpeed(rate)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.775rem',
                  fontWeight: 800,
                  border: playbackRate === rate ? '1px solid #fc4c02' : '1px solid #cbd5e1',
                  background: playbackRate === rate ? '#fc4c02' : '#f8fafc',
                  color: playbackRate === rate ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynchronizedVideoTelemetryPlayer;
