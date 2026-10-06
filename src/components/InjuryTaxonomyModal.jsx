import React, { useState } from 'react';
import { INJURY_TAXONOMIES } from '../data/injuryTaxonomyData';
import { Search, X, BookOpen, Activity, AlertCircle, Award, Stethoscope } from 'lucide-react';

const InjuryTaxonomyModal = ({ isOpen, onClose, onSelectInjury = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeInjury, setActiveInjury] = useState(INJURY_TAXONOMIES[0]);

  if (!isOpen) return null;

  const regions = ['All', ...new Set(INJURY_TAXONOMIES.map(i => i.bodyRegion))];

  const filtered = INJURY_TAXONOMIES.filter(i => {
    const matchesRegion = selectedRegion === 'All' || i.bodyRegion === selectedRegion;
    const matchesSearch = !searchTerm || 
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.pathology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.bodyRegion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
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
              <h2 className="text-xl font-bold">Standardized Clinical Injury Taxonomy (OSIICS v11 / OSICS v10)</h2>
              <p className="text-xs text-muted" style={{ color: '#94a3b8' }}>
                IOC Approved Orthopedic & Sports Medicine Diagnostic Classification ({INJURY_TAXONOMIES.length} Primary Taxonomies)
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
              placeholder="Search by OSIICS code (e.g. KJAC), body region, or pathology..."
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

        {/* Content Body */}
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
                  key={inj.code}
                  onClick={() => setActiveInjury(inj)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    background: activeInjury?.code === inj.code ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                    borderLeft: activeInjury?.code === inj.code ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm" style={{ color: activeInjury?.code === inj.code ? 'var(--primary-hover)' : 'var(--text-main)' }}>
                      {inj.pathology}
                    </h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#e2e8f0', color: '#1e293b' }}>
                      {inj.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-primary">{inj.bodyRegion}</span>
                    <span>•</span>
                    <span>{inj.tissueType}</span>
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
                {/* Title Banner */}
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          OSIICS {activeInjury.code}
                        </span>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{activeInjury.pathology}</h3>
                      </div>
                      <p className="text-xs text-muted mt-2">{activeInjury.description}</p>
                    </div>
                    {onSelectInjury && (
                      <button 
                        onClick={() => { onSelectInjury(activeInjury); onClose(); }}
                        className="btn-primary" 
                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                      >
                        Select Code
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage-Gated Recovery Phases */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                    <Award size={16} /> Stage-Gated Clinical Recovery Phases & Clearance Criteria
                  </h4>
                  {activeInjury.phases.map(ph => (
                    <div key={ph.phaseNumber} style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-dark">Phase {ph.phaseNumber}: {ph.phaseName}</span>
                        <span className="text-xs text-muted font-semibold">{ph.weeks}</span>
                      </div>
                      <p className="text-xs text-muted mb-2"><strong>Primary Goal:</strong> {ph.goals}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs" style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '4px' }}>
                        <div>
                          <strong className="text-success">Clearance Criteria:</strong>
                          <ul className="list-disc pl-4 text-muted mt-1">
                            {Object.entries(ph.clearanceCriteria).map(([k, v]) => (
                              <li key={k}><strong>{k}:</strong> {v}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-danger">Kinematic Risk Thresholds:</strong>
                          <ul className="list-disc pl-4 text-muted mt-1">
                            {Object.entries(ph.riskThresholds).map(([k, v]) => (
                              <li key={k}><strong>{k}:</strong> {v}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
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
