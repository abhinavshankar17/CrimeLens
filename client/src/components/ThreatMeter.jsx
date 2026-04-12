import React, { useEffect, useState } from 'react';

const ThreatMeter = ({ score = 0, level = 'MINIMAL' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = score / 30; // Animate over ~30 frames
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [score]);

  // Determine colors based on level
  let color = 'var(--threat-minimal)'; // Default MINIMAL
  if (level === 'CRITICAL') color = 'var(--threat-critical)';
  if (level === 'HIGH') color = 'var(--threat-high)';
  if (level === 'MEDIUM') color = 'var(--threat-medium)';
  if (level === 'LOW') color = 'var(--threat-low)';

  // Calculate SVG arc
  const radius = 80;
  const circumference = Math.PI * radius; // Semi-circle
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', '--pulse-color': color }}>
      <div style={{ position: 'relative', width: '200px', height: '110px' }}>
        {/* Background Arc */}
        <svg fill="transparent" width="200" height="110" viewBox="0 0 200 110">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Foreground Arc */}
        <svg fill="transparent" width="200" height="110" viewBox="0 0 200 110" style={{ position: 'absolute', top: 0, left: 0 }}>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* Score Display (Absolute Centered) */}
        <div style={{
          position: 'absolute', top: '70px', left: '0', width: '100%',
          textAlign: 'center', transform: 'translateY(-50%)'
        }}>
          <span className="mono" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', textShadow: `0 0 20px ${color}` }}>
            {animatedScore}
          </span>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem 1.5rem', 
        borderRadius: '2rem', 
        fontWeight: 'bold',
        letterSpacing: '2px',
        color,
        background: `rgba(${color === 'var(--threat-critical)' ? '239,68,68' : '255,255,255'}, 0.1)`,
        animation: 'pulse-glow 2s infinite',
        border: `1px solid ${color}`
      }}>
        {level}
      </div>
    </div>
  );
};

export default ThreatMeter;
