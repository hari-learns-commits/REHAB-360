import React, { useState } from 'react';
import { saveDoctorWorkoutPlan, getAthleteWorkoutPlan } from '../services/workoutPlanService';
import { draftClinicalPrescription } from '../services/geminiService';
import { INJURY_TAXONOMIES } from '../data/injuryTaxonomyData';
import { Plus, Trash2, X, Stethoscope, ShieldCheck, Sparkles } from 'lucide-react';

const DoctorWorkoutDrafterModal = ({ isOpen, onClose, athlete, onSaved }) => {
  const existingPlan = athlete ? getAthleteWorkoutPlan(athlete.id) : null;

  const [phase, setPhase] = useState(existingPlan?.phase || 'Phase 2 - Controlled Strength & Motion');
  const [taxonomyCode, setTaxonomyCode] = useState('KJAC');
  const [isDrafting, setIsDrafting] = useState(false);
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

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const taxonomy = INJURY_TAXONOMIES.find(t => t.code === taxonomyCode) || INJURY_TAXONOMIES[0];
      const aiResult = await draftClinicalPrescription(
        { surgery_date: '2026-08-15', current_rehab_phase: 2, affected_side: 'Right', average_readiness: 85 },
        { mean_lsi: 88, mean_rom: 110, frequent_flaws: ['Dynamic Valgus Wobble'] },
        taxonomy
      );

      if (aiResult?.prescriptions) {
        const draftedExs = aiResult.prescriptions.map((p, idx) => ({
          id: `ai-ex-${Date.now()}-${idx}`,
          title: p.exercise_name,
          reps: `${p.target_sets} sets x ${p.target_reps} reps`,
          targetJointAngle: `ROM ${p.min_rom_degrees}° - ${p.max_rom_degrees || 120}°, Max Valgus ${p.max_valgus_angle_allowed}°`,
          instructions: p.clinical_notes,
          completed: false
        }));

        setExercises(draftedExs);
        setClinicalNotes(`[AI Clinical Drafter] ${aiResult.clinical_rationale}`);
      }
    } catch (e) {
      console.warn("AI Drafter error:", e);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newPlan = {
      athleteId: athlete.id,
      athleteName: athlete.name,
      doctorId: "DOC-101",
      doctorName: "Dr. Valli",
      injuryId: taxonomyCode,
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-primary">
                <ShieldCheck size={18} /> OSIICS v11 Taxonomy & Stage-Gated Prescription
              </div>
              <button
                type="button"
                onClick={handleAIDraft}
                disabled={isDrafting}
                className="btn-secondary flex items-center gap-1.5"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: '#1e293b', color: '#fff' }}
              >
                <Sparkles size={14} color="var(--primary)" />
                {isDrafting ? 'Drafting Protocol...' : 'AI Auto-Draft Protocol'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">OSIICS Diagnostic Code</label>
              <select
                value={taxonomyCode}
                onChange={(e) => setTaxonomyCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {INJURY_TAXONOMIES.map(t => (
                  <option key={t.code} value={t.code}>
                    {t.code} — {t.pathology}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <label className="text-xs font-bold text-muted mb-1 block">Clinical Notes & Protocol Instructions</label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Exercises List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-dark">Prescribed Exercise List ({exercises.length})</h4>
              <button 
                type="button" 
                onClick={addExercise}
                className="btn-secondary flex items-center gap-1"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
              >
                <Plus size={14} /> Add Exercise
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {exercises.map((ex, index) => (
                <div key={ex.id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-primary">Exercise #{index + 1}</span>
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
                    <input 
                      type="text" 
                      placeholder="Exercise Name"
                      value={ex.title}
                      onChange={(e) => updateExercise(ex.id, 'title', e.target.value)}
                      required
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Reps/Sets (e.g., 3 sets x 10 reps)"
                      value={ex.reps}
                      onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                      required
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Target Angle / ROM"
                      value={ex.targetJointAngle}
                      onChange={(e) => updateExercise(ex.id, 'targetJointAngle', e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <input 
                    type="text" 
                    placeholder="Specific clinical instructions or precautions..."
                    value={ex.instructions}
                    onChange={(e) => updateExercise(ex.id, 'instructions', e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              Publish Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorWorkoutDrafterModal;
