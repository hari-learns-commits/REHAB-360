import React, { useState } from 'react';
import { INJURY_TAXONOMY, searchInjuries } from '../data/injuryTaxonomy';
import { Search, X, BookOpen, Activity, AlertCircle, Award, Stethoscope, ChevronRight } from 'lucide-react';

const InjuryTaxonomyModal = ({ isOpen, onClose, onSelectInjury = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeInjury, setActiveInjury] = useState(INJURY_TAXONOMY[0]);

  if (!isOpen) return null;

  const regions = ['All', ...new Set(INJURY_TAXONOMY.map(i => i.body_region))];

  const filtered = searchInjuries(searchTerm).filter(i => {
    if (selectedRegion === 'All') return true;
    return i.body_region === selectedRegion;
  });

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
        maxWidth: '1100px',
        maxHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--primary)',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)'
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
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Comprehensive Athletic Injury Taxonomy & ICD Database</h2>
              <p className="text-xs text-muted" style={{ color: '#94a3b8' }}>
                Sports Medicine & Orthopedic Clinical Taxonomy ({INJURY_TAXONOMY.length} Categories)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={24} />
          </button>
        </div>

        {/* Search & Region Filter Bar */}
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search by injury name, body region, tissue, or ICD code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div className="flex gap-1" style={{ overflowX: 'auto', paddingBottom: '2px' }}>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: selectedRegion === r ? 'none' : '1px solid var(--border-color)',
                  background: selectedRegion === r ? 'var(--primary)' : '#ffffff',
                  color: selectedRegion === r ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Sidebar list + Detail view */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ flex: 1, overflow: 'hidden' }}>
          {/* List Sidebar */}
          <div style={{
            borderRight: '1px solid var(--border-color)',
            overflowY: 'auto',
            maxHeight: '60vh',
            background: '#ffffff'
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No matching athletic injuries found.
              </div>
            ) : (
              filtered.map(inj => (
                <div
                  key={inj.id}
                  onClick={() => setActiveInjury(inj)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    background: activeInjury?.id === inj.id ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                    borderLeft: activeInjury?.id === inj.id ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm" style={{ color: activeInjury?.id === inj.id ? 'var(--primary-hover)' : 'var(--text-main)' }}>
                      {inj.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#e2e8f0', color: '#334155' }}>
                      {inj.icd_codes['ICD-10']}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-primary">{inj.body_region}</span>
                    <span>•</span>
                    <span>{inj.tissue_type}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Injury Detail View */}
          <div className="md:col-span-2" style={{
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            maxHeight: '60vh',
            background: '#fafafa'
          }}>
            {activeInjury ? (
              <div className="flex flex-col gap-6">
                {/* Title & Classification Banner */}
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{activeInjury.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                        <span className="font-semibold text-primary">{activeInjury.body_region}</span>
                        <span>|</span>
                        <span>Tissue: <strong>{activeInjury.tissue_type}</strong></span>
                        <span>|</span>
                        <span>Course: <strong>{activeInjury.acute_vs_chronic}</strong></span>
                      </div>
                    </div>
                    {onSelectInjury && (
                      <button 
                        onClick={() => { onSelectInjury(activeInjury); onClose(); }}
                        className="btn-primary" 
                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                      >
                        Select Diagnosis
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4 mt-4 text-xs" style={{ background: '#f1f5f9', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div><strong>ICD-10:</strong> {activeInjury.icd_codes['ICD-10']}</div>
                    <div><strong>ICD-11:</strong> {activeInjury.icd_codes['ICD-11']}</div>
                    <div><strong>Synonyms:</strong> {activeInjury.synonyms.join(', ')}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mechanisms & Sports */}
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <h4 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
                      <Activity size={16} /> Mechanisms & Typical Sports
                    </h4>
                    <p className="text-xs text-muted mb-2"><strong>Mechanisms:</strong> {activeInjury.mechanism.join(', ')}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeInjury.sport_examples.map(s => (
                        <span key={s} style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Signs & Symptoms */}
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <h4 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
                      <Stethoscope size={16} /> Signs & Clinical Symptoms
                    </h4>
                    <ul className="text-xs text-muted list-disc pl-4 space-y-1">
                      {activeInjury.signs_symptoms.map(ss => (
                        <li key={ss}>{ss}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Diagnostics & Severity */}
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <h4 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
                      <AlertCircle size={16} /> Diagnostics & Severity Grading
                    </h4>
                    <p className="text-xs text-muted mb-2"><strong>Tests:</strong> {activeInjury.diagnostic_tests.join(', ')}</p>
                    <p className="text-xs text-muted"><strong>Grading:</strong> {activeInjury.severity_grades.join(' / ')}</p>
                  </div>

                  {/* Treatment & RTP Criteria */}
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <h4 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
                      <Award size={16} /> Treatment & Return-to-Play
                    </h4>
                    <p className="text-xs text-muted mb-2">
                      <strong>Rehab Timeline:</strong> {activeInjury.rehabilitation_timeline_weeks[0]}-{activeInjury.rehabilitation_timeline_weeks[1]} Weeks
                    </p>
                    <p className="text-xs text-muted mb-2"><strong>Standard Treatment:</strong> {activeInjury.standard_treatment.join('; ')}</p>
                    <p className="text-xs text-muted"><strong>RTP Criteria:</strong> {activeInjury.return_to_play_criteria.join('; ')}</p>
                  </div>
                </div>

                {/* Complications & Prevention */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-danger">Complications:</strong>
                      <p className="text-muted mt-1">{activeInjury.complications.join(', ')}</p>
                    </div>
                    <div>
                      <strong className="text-success">Evidence-Based Prevention:</strong>
                      <p className="text-muted mt-1">{activeInjury.preventive_measures.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InjuryTaxonomyModal;
