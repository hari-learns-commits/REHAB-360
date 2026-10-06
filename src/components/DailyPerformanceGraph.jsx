import React, { useState } from 'react';

const DAILY_PERFORMANCE_DATA = [
  { day: 'Mon', strength: 65, agility: 58, form: 75, fitness: 62 },
  { day: 'Tue', strength: 68, agility: 62, form: 78, fitness: 65 },
  { day: 'Wed', strength: 72, agility: 68, form: 82, fitness: 70 },
  { day: 'Thu', strength: 76, agility: 71, form: 85, fitness: 74 },
  { day: 'Fri', strength: 80, agility: 75, form: 88, fitness: 78 },
  { day: 'Sat', strength: 84, agility: 79, form: 90, fitness: 82 },
  { day: 'Sun', strength: 88, agility: 84, form: 94, fitness: 86 }
];

const METRIC_CONFIGS = {
  all: {
    label: 'Combined Overview (All Parameters)',
    unit: '%',
    target: 'Overall Performance: 88%',
    color: '#FF5500',
    statusText: 'All 4 Metrics Tracking Upward'
  },
  strength: {
    label: 'Strength Score',
    unit: '%',
    target: 'Target: ≥ 85%',
    color: '#FF5500', // Electric Orange
    min: 50,
    max: 100,
    getValue: (d) => d.strength,
    statusText: '+23% Strength Gain Over 7 Days'
  },
  agility: {
    label: 'Agility Score',
    unit: '%',
    target: 'Target: ≥ 80%',
    color: '#2563EB', // Royal Blue
    min: 50,
    max: 100,
    getValue: (d) => d.agility,
    statusText: '+26% Agility Improvement'
  },
  form: {
    label: 'Form Accuracy',
    unit: '%',
    target: 'Target: ≥ 90%',
    color: '#059669', // Emerald Green
    min: 50,
    max: 100,
    getValue: (d) => d.form,
    statusText: 'High Biomechanical Precision'
  },
  fitness: {
    label: 'Fitness Level',
    unit: '%',
    target: 'Target: ≥ 85%',
    color: '#7C3AED', // Deep Purple
    min: 50,
    max: 100,
    getValue: (d) => d.fitness,
    statusText: 'Consistent Cardiovascular Endurance'
  }
};

const DailyPerformanceGraph = () => {
  const [activeMetric, setActiveMetric] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);

  const chartHeight = 240;
  const chartWidth = 700;
  const paddingX = 45;
  const paddingY = 35;
  const minVal = 50;
  const maxVal = 100;

  // Compute SVG Points for a metric key
  const getPointsForMetric = (key) => {
    return DAILY_PERFORMANCE_DATA.map((d, index) => {
      const val = d[key];
      const x = paddingX + (index / (DAILY_PERFORMANCE_DATA.length - 1)) * (chartWidth - 2 * paddingX);
      const normalizedY = (val - minVal) / (maxVal - minVal);
      const y = chartHeight - paddingY - normalizedY * (chartHeight - 2 * paddingY);
      return { x, y, val, day: d.day };
    });
  };

  const activeConfig = METRIC_CONFIGS[activeMetric];

  return (
    <div className="glass-card" style={{ padding: '2rem', background: '#ffffff', border: '1px solid #f1f5f9' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold text-primary block mb-1" style={{ letterSpacing: '0.05em' }}>ATHLETE PERFORMANCE TRACKER</span>
          <h3 className="text-xl font-bold text-main">Daily Performance Graph</h3>
        </div>
        <div style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
          {activeConfig.statusText}
        </div>
      </div>

      {/* Metric Selector Tabs with Color Indicators */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Parameters (Combined)', color: '#0f172a' },
          { key: 'strength', label: 'Strength', color: '#FF5500' },
          { key: 'agility', label: 'Agility', color: '#2563EB' },
          { key: 'form', label: 'Form Accuracy', color: '#059669' },
          { key: 'fitness', label: 'Fitness Level', color: '#7C3AED' }
        ].map((tab) => {
          const isActive = activeMetric === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveMetric(tab.key)}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 600,
                border: isActive ? `2px solid ${tab.color}` : '1px solid #f1f5f9',
                cursor: 'pointer',
                background: isActive ? tab.color : '#fafafa',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {!isActive && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tab.color, display: 'inline-block' }}></span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Performance Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Horizontal Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* COMBINED MULTI-LINE OVERVIEW GRAPH */}
          {activeMetric === 'all' ? (
            <>
              {['strength', 'agility', 'form', 'fitness'].map((metricKey) => {
                const metricPts = getPointsForMetric(metricKey);
                const metricColor = METRIC_CONFIGS[metricKey].color;
                const pathD = metricPts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

                return (
                  <g key={metricKey}>
                    {/* Trend Line */}
                    <path d={pathD} fill="none" stroke={metricColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Points */}
                    {metricPts.map((p, index) => (
                      <circle
                        key={index}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="#ffffff"
                        stroke={metricColor}
                        strokeWidth="2.5"
                        onMouseEnter={() => setHoveredDay({ day: p.day, key: metricKey, val: p.val })}
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </g>
                );
              })}
            </>
          ) : (
            /* SINGLE PARAMETER INDIVIDUAL COLOR GRAPH */
            (() => {
              const singlePts = getPointsForMetric(activeMetric);
              const singleColor = activeConfig.color;
              const pathD = singlePts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

              return (
                <g>
                  {/* Area Fill */}
                  <path
                    d={`${pathD} L ${singlePts[singlePts.length - 1].x} ${chartHeight - paddingY} L ${singlePts[0].x} ${chartHeight - paddingY} Z`}
                    fill={`${singleColor}15`}
                  />
                  {/* Line */}
                  <path d={pathD} fill="none" stroke={singleColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data Points */}
                  {singlePts.map((p, index) => (
                    <g key={index} onMouseEnter={() => setHoveredDay({ day: p.day, key: activeMetric, val: p.val })} onMouseLeave={() => setHoveredDay(null)} style={{ cursor: 'pointer' }}>
                      <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke={singleColor} strokeWidth="3" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="700">
                        {p.val}%
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()
          )}

          {/* X Axis Day Labels */}
          {DAILY_PERFORMANCE_DATA.map((d, index) => {
            const x = paddingX + (index / (DAILY_PERFORMANCE_DATA.length - 1)) * (chartWidth - 2 * paddingX);
            return (
              <text key={index} x={x} y={chartHeight - 8} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                {d.day}
              </text>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredDay && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.4rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {hoveredDay.day} - {METRIC_CONFIGS[hoveredDay.key].label}: <span style={{ color: METRIC_CONFIGS[hoveredDay.key].color }}>{hoveredDay.val}%</span>
          </div>
        )}
      </div>

      {/* Multi-Parameter Color Legend Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 flex-wrap gap-4 text-xs" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="font-bold text-main">Legend:</span>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#FF5500' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5500' }}></span> Strength
          </span>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#2563EB' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }}></span> Agility
          </span>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#059669' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }}></span> Form Accuracy
          </span>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#7C3AED' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7C3AED' }}></span> Fitness Level
          </span>
        </div>
        <span className="text-muted">7-Day Trend: <strong className="text-primary">+18% Combined Growth</strong></span>
      </div>
    </div>
  );
};

export default DailyPerformanceGraph;
