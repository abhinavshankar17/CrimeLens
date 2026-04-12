import React from 'react';

const DetectionList = ({ detections, onHoverDetection }) => {
  if (!detections || detections.length === 0) return null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'weapons': return 'var(--threat-critical)'; // Red
      case 'people': return 'var(--accent-blue)';
      case 'vehicles': return 'var(--threat-low)'; // Green
      case 'objects': return 'var(--threat-medium)'; // Yellow
      default: return 'var(--text-muted)'; // Gray
    }
  };

  // Sort by confidence descending
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        Detected Objects ({detections.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sorted.map((det, idx) => (
          <div 
            key={idx}
            onMouseEnter={() => onHoverDetection?.(det)}
            onMouseLeave={() => onHoverDetection?.(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getCategoryColor(det.category) }} />
            <div style={{ flex: 1, textTransform: 'capitalize', fontWeight: 500 }}>
              {det.class}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100px' }}>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {Math.round(det.confidence * 100)}%
              </span>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', marginTop: '4px' }}>
                <div style={{ width: `${det.confidence * 100}%`, background: getCategoryColor(det.category), height: '100%', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetectionList;
