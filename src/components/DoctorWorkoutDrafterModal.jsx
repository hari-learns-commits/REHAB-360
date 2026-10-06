import React, { useState } from 'react';
import { saveDoctorWorkoutPlan, getAthleteWorkoutPlan } from '../services/workoutPlanService';
import { Plus, Trash2, X, Stethoscope, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

const DoctorWorkoutDrafterModal = ({ isOpen, onClose, athlete, onSaved }) => {
  const existingPlan = athlete ? getAthleteWorkoutPlan(athlete.id) : null;

  const [phase, setPhase] = useState(existingPlan?.phase || 'Phase 2 - Controlled Strength & Motion');
  const [clinicalNotes, setClinicalNotes] = useState(
    existingPlan?.clinicalNotes || 'Doctor prescribed directive. Focus on knee valgus control and smooth eccentric flexion.'
  );
  const [exercises, setExercises] = useState(
    existingPlan?.exercises?.length > 0
      ? existingPlan.exercises
      : [
          {
            id: `ex-${Date.now()}-1`,
            title: 'Single Leg Balance (Eyes Open)',
            reps: '3 sets x 30 seconds',
            targetJointAngle: 'Knee flexion 5-10°',
            instructions: 'Maintain pelvis stability and core tension.',
            completed: false
          },
          {
            id: `ex-${Date.now()}-2`,
            title: 'Assisted Squats',
            reps: '3 sets x 12 reps',
            targetJointAngle: 'Knee flexion 0 to 90°',
            instructions: 'Keep weight on heels; prevent knee valgus collapse.',
            completed: false
          }
        ]
  );

  if (!isOpen || !athlete) return null;

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: `ex-${Date.now()}-${exercises.length + 1}`,
        title: '',
        reps: '3 sets x 10 reps',
        targetJointAngle: 'Controlled ROM',
        instructions: '',
        completed: false
      }
    ]);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newPlan = {
      athleteId: athlete.id,
      athleteName: athlete.name,
      doctorId: "DOC-101",
      doctorName: "Dr. Valli",
      injuryId: athlete.injuryId || "KNEE_001",
      phase,
      clinicalNotes,
      exercises
    };

    saveDoctorWorkoutPlan(newPlan);
    if (onSaved) onSaved(newPlan);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card flex flex-col" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--primary)'
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
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              color: '#fff'
            }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Doctor's Clinical Workout Prescription</h2>
              <p className="text-xs text-muted" style={{ color: '#94a3b8' }}>
                Prescribing Workout Plan for Athlete: <strong>{athlete.name}</strong> (Assigned Specialist: Dr. Valli)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(249, 115, 22, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
            <div className="flex items-center gap-2 font-bold text-sm text-primary mb-1">
              <ShieldCheck size={18} /> Direct Clinical Rule Enforced
            </div>
            <p className="text-xs text-muted">
              The workout plan is directly authored by the assigned doctor (Dr. Valli). The AI engine does <strong>NOT</strong> auto-draft the exercises. The athlete is required to complete this exact plan and log video proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Rehabilitation Phase</label>
              <input 
                type="text" 
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Diagnosed Condition</label>
              <input 
                type="text" 
                value={athlete.injury || athlete.conditionName || "Knee Ligament Strain"}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: '#f1f5f9',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted mb-1 block">Doctor Clinical Directives & Biomechanical Constraints</label>
            <textarea 
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="E.g., Maintain heel pressure; limit knee valgus past 5 degrees; monitor pain score..."
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Exercise List Editor */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-main">Prescribed Exercise Routines ({exercises.length})</h4>
              <button 
                type="button" 
                onClick={addExercise}
                className="btn-outline" 
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
              >
                <Plus size={14} /> Add Prescribed Exercise
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {exercises.map((ex, idx) => (
                <div key={ex.id} style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-primary">Exercise #{idx + 1}</span>
                    {exercises.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeExercise(ex.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="text-xs text-muted block mb-1">Exercise Title</label>
                      <input 
                        type="text" 
                        value={ex.title}
                        onChange={(e) => updateExercise(ex.id, 'title', e.target.value)}
                        placeholder="E.g., Assisted Deep Squats"
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Sets & Reps / Duration</label>
                      <input 
                        type="text" 
                        value={ex.reps}
                        onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                        placeholder="E.g., 3 sets x 12 reps"
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted block mb-1">Target Joint Angle Constraint</label>
                      <input 
                        type="text" 
                        value={ex.targetJointAngle}
                        onChange={(e) => updateExercise(ex.id, 'targetJointAngle', e.target.value)}
                        placeholder="E.g., Knee flexion up to 90°"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Patient Technique Form Instructions</label>
                      <input 
                        type="text" 
                        value={ex.instructions}
                        onChange={(e) => updateExercise(ex.id, 'instructions', e.target.value)}
                        placeholder="E.g., Keep heels grounded, core braced"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={18} /> Publish Doctor Directive & Assign to Athlete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorWorkoutDrafterModal;
