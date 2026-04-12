import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const PatternAlert = ({ pattern }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const severityColor = pattern.severity === 'high' ? 'var(--threat-critical)' : 'var(--threat-medium)';

  return (
    <div 
      className="animate-slide-up"
      style={{
        background: `linear-gradient(to right, rgba(${pattern.severity === 'high' ? '239,68,68' : '234,179,8'}, 0.2), transparent)`,
        borderLeft: `4px solid ${severityColor}`,
        borderTop: '1px solid var(--glass-border)',
        borderRight: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '1rem',
        position: 'relative'
      }}
    >
      <div style={{ padding: '0.25rem' }}>
        <AlertTriangle color={severityColor} size={24} />
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ color: severityColor, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
          Pattern Detected: {pattern.type}
        </h4>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          {pattern.message}
        </p>
      </div>

      <button 
        onClick={() => setVisible(false)}
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default PatternAlert;
