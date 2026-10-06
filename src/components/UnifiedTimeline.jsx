import React from 'react';
import { useRehabData } from '../context/RehabDataContext';
import { Stethoscope, Activity, FileText, CheckCircle, Video, Calendar } from 'lucide-react';

const UnifiedTimeline = () => {
  const { timeline = [] } = useRehabData();

  const getIcon = (type) => {
    switch (type) {
      case 'ortho':
        return <Stethoscope size={20} color="var(--primary)" />;
      case 'physio':
        return <Activity size={20} color="var(--primary)" />;
      case 'diagnostic':
        return <FileText size={20} color="var(--primary)" />;
      case 'athlete':
        return <Video size={20} color="var(--primary)" />;
      default:
        return <CheckCircle size={20} color="var(--primary)" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', background: '#ffffff' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-main">Unified Athlete Journey Timeline</h3>
          <p className="text-base text-muted">Shared chronological feed across Ortho, Physio, and Athlete updates</p>
        </div>
        <span style={{ fontSize: '0.85rem', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800 }}>
          {timeline.length} Events Logged
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '2.25rem', borderLeft: '2px dashed #fed7aa' }}>
        {timeline.map((item, index) => (
          <div key={item.id || index} style={{ marginBottom: '2rem', position: 'relative' }}>
            {/* Timeline Node Badge */}
            <div
              style={{
                position: 'absolute',
                left: '-3.25rem',
                top: '0',
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.15)'
              }}
            >
              {getIcon(item.type)}
            </div>

            <div style={{ background: '#fafafa', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-base font-bold text-main">{item.title}</span>
                <span className="text-xs text-muted flex items-center gap-1 font-mono">
                  <Calendar size={14} /> {item.date}
                </span>
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedTimeline;
