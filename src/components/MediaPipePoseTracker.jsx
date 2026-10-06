// src/components/MediaPipePoseTracker.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EXERCISE_REGISTRY } from '../data/exerciseRegistry';
import { analyzeWorkoutSession } from '../services/geminiService';
import { saveWorkoutSessionRecord } from '../services/workoutPlanService';

export default function MediaPipePoseTracker({ onRepComplete, onSessionSummary }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [selectedExerciseId, setSelectedExerciseId] = useState('squat');
  const [repCount, setRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [currentStage, setCurrentStage] = useState('up');
  const [formFeedback, setFormFeedback] = useState('Position yourself in view');
  const [cameraStatus, setCameraStatus] = useState('Initializing camera...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Mutable refs immune to re-render lag
  const telemetryLog = useRef([]);
  const activeExerciseRef = useRef(selectedExerciseId);
  const trackerRef = useRef({
    stage: 'up',
    minAngle: 180,
    maxAngle: 0,
    repStartTime: null,
    count: 0
  });

  useEffect(() => {
    activeExerciseRef.current = selectedExerciseId;
  }, [selectedExerciseId]);

  // Robust joint angle computation using 2D dot product
  const getAngle = (a, b, c) => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.hypot(ab.x, ab.y);
    const magCB = Math.hypot(cb.x, cb.y);
    if (magAB === 0 || magCB === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
    return Math.round(Math.acos(cosAngle) * (180 / Math.PI));
  };

  const processPose = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return;

    const config = EXERCISE_REGISTRY[activeExerciseRef.current];
    if (!config) return;

    const { primaryJoints, thresholds, formChecks } = config;

    // Pick side with superior visibility
    const leftVis = (landmarks[primaryJoints.left[0]]?.visibility || 0) +
                    (landmarks[primaryJoints.left[1]]?.visibility || 0) +
                    (landmarks[primaryJoints.left[2]]?.visibility || 0);

    const rightVis = (landmarks[primaryJoints.right[0]]?.visibility || 0) +
                     (landmarks[primaryJoints.right[1]]?.visibility || 0) +
                     (landmarks[primaryJoints.right[2]]?.visibility || 0);

    const side = leftVis >= rightVis ? 'left' : 'right';
    const indices = primaryJoints[side];
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];

    // If joints are hidden or below 0.5 confidence, skip frame without breaking state
    if (!p1 || !p2 || !p3 || p1.visibility < 0.5 || p2.visibility < 0.5 || p3.visibility < 0.5) {
      setFormFeedback('Ensure hips, knees, and ankles are clearly visible');
      return;
    }

    const angle = getAngle(p1, p2, p3);
    setCurrentAngle(angle);

    const now = performance.now();
    const st = trackerRef.current;
    const isDecreasing = thresholds.direction === 'decreasing';

    st.minAngle = Math.min(st.minAngle, angle);
    st.maxAngle = Math.max(st.maxAngle, angle);

    // Evaluate dynamic form checkpoints
    let fault = null;
    if (formChecks && formChecks.length > 0) {
      for (const fc of formChecks) {
        if (!fc.check(landmarks, side)) {
          fault = fc.faultMessage;
          break;
        }
      }
    }
    setFormFeedback(fault || 'Good mechanics — maintain tempo');

    // State Transition: Eccentric / Contraction
    if (st.stage === 'up') {
      const reachedInflection = isDecreasing 
        ? angle <= thresholds.inflectionAngle 
        : angle >= thresholds.inflectionAngle;

      if (reachedInflection) {
        st.stage = 'down';
        st.repStartTime = now;
        setCurrentStage('down');
      }
    }

    // State Transition: Concentric / Extension & Rep Count Completion
    if (st.stage === 'down') {
      const returnedToNeutral = isDecreasing
        ? angle >= thresholds.neutralAngle
        : angle <= thresholds.neutralAngle;

      if (returnedToNeutral) {
        const duration = now - (st.repStartTime || now);

        if (duration >= thresholds.minRepDurationMs && duration <= thresholds.maxRepDurationMs) {
          st.count += 1;
          setRepCount(st.count);

          const repData = {
            repNumber: st.count,
            exerciseId: activeExerciseRef.current,
            durationMs: Math.round(duration),
            peakAngle: isDecreasing ? st.minAngle : st.maxAngle,
            formFaults: fault ? [fault] : [],
            timestamp: new Date().toISOString()
          };

          telemetryLog.current.push(repData);
          if (onRepComplete) onRepComplete(repData);
        }

        // Reset tracking window
        st.stage = 'up';
        st.minAngle = 180;
        st.maxAngle = 0;
        st.repStartTime = null;
        setCurrentStage('up');
      }
    }
  }, [onRepComplete]);

  // Camera & MediaPipe Initialization with proper teardown
  useEffect(() => {
    let camera = null;
    let pose = null;
    let isMounted = true;

    const startTracker = async () => {
      try {
        if (!window.Pose || !window.Camera) {
          setCameraStatus('MediaPipe scripts missing. Verify index.html.');
          return;
        }

        pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!isMounted) return;
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            if (window.drawConnectors && window.drawLandmarks) {
              window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                color: '#10B981',
                lineWidth: 3,
              });
              window.drawLandmarks(ctx, results.poseLandmarks, {
                color: '#EF4444',
                lineWidth: 1,
                radius: 4,
              });
            }
            processPose(results.poseLandmarks);
          }
          ctx.restore();
        });

        if (videoRef.current) {
          camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && pose && isMounted) {
                await pose.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          await camera.start();
          if (isMounted) setCameraStatus('Live');
        }
      } catch (err) {
        console.error('Camera/Pose Error:', err);
        if (isMounted) setCameraStatus(`Camera error: ${err.message}`);
      }
    };

    startTracker();

    return () => {
      isMounted = false;
      if (camera) {
        try { camera.stop(); } catch (_) {}
      }
      if (pose) {
        try { pose.close(); } catch (_) {}
      }
    };
  }, [processPose]);

  const handleExerciseChange = (e) => {
    setSelectedExerciseId(e.target.value);
    setRepCount(0);
    trackerRef.current = { stage: 'up', minAngle: 180, maxAngle: 0, repStartTime: null, count: 0 };
    telemetryLog.current = [];
  };

  const handleFinishWorkout = async () => {
    if (telemetryLog.current.length === 0) {
      alert('No repetitions were recorded. Complete at least one rep before generating an AI report.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const report = await analyzeWorkoutSession(telemetryLog.current, 'Athlete');
      setAiReport(report);

      await saveWorkoutSessionRecord({
        athleteId: 'athlete-current',
        exerciseId: selectedExerciseId,
        telemetryLog: telemetryLog.current,
        report
      });

      if (onSessionSummary) onSessionSummary({ telemetry: telemetryLog.current, report });
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <label className="text-sm font-semibold text-slate-300">
          Exercise:
          <select
            value={selectedExerciseId}
            onChange={handleExerciseChange}
            className="ml-2 bg-slate-700 text-white rounded px-3 py-1 font-mono text-sm"
          >
            {Object.values(EXERCISE_REGISTRY).map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </label>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          cameraStatus === 'Live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {cameraStatus}
        </span>
      </div>

      <div className="relative aspect-[4/3] bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        {/* Telemetry HUD */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-3 text-white space-y-1">
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {repCount} <span className="text-xs text-slate-400 font-sans">REPS</span>
          </div>
          <div className="text-xs font-mono text-slate-300">
            Joint Angle: <span className="text-amber-400 font-bold">{currentAngle}°</span>
          </div>
          <div className="text-xs font-mono text-slate-300">
            Phase: <span className="uppercase text-cyan-400 font-semibold">{currentStage}</span>
          </div>
        </div>

        <div className="absolute bottom-4 inset-x-4 bg-slate-900/85 backdrop-blur-sm border border-slate-700 rounded-lg py-2 px-4 text-center">
          <p className="text-xs font-semibold text-slate-200">{formFeedback}</p>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 bg-slate-800 border-t border-slate-700">
        <span className="text-xs text-slate-400">
          Telemetry Queue: <span className="text-white font-mono">{telemetryLog.current.length} reps</span>
        </span>
        <button
          onClick={handleFinishWorkout}
          disabled={isAnalyzing || telemetryLog.current.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow"
        >
          {isAnalyzing ? 'Analyzing Real Data...' : 'End & Generate AI Report'}
        </button>
      </div>

      {aiReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 text-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white">Verified AI Biomechanical Report</h3>
              <button onClick={() => setAiReport(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="prose prose-invert prose-sm text-slate-300 whitespace-pre-wrap">
              {aiReport.summaryMarkdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
