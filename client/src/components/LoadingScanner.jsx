import React, { useState, useEffect } from 'react';

const LoadingScanner = ({ imageUrl }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const phases = [
    "Analyzing scene parameters...",
    "Detecting objects and entities...",
    "Computing threat assessment...",
    "Generating forensic report...",
    "Finalizing visual intelligence map..."
  ];

  useEffect(() => {
    // Cycle text phases
    const phaseInterval = setInterval(() => {
      setPhaseIndex(prev => (prev < phases.length - 1 ? prev + 1 : prev));
    }, 2500);

    // Update progress counter
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        return prev + Math.floor(Math.random() * 5);
      });
    }, 200);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="glass-card" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Background Image Dimmed */}
      <img 
        src={imageUrl} 
        alt="Uploading" 
        style={{ width: '100%', display: 'block', opacity: 0.3, filter: 'grayscale(50%)' }}
      />
      
      {/* Scanner Animation Layer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {/* Animated Line */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'var(--accent-cyan)',
          boxShadow: '0 0 15px var(--accent-cyan), 0 0 30px var(--accent-cyan)',
          animation: 'scan-line 3s linear infinite'
        }} />
      </div>

      {/* Overlay UI */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(5px)',
        padding: '1rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--accent-cyan)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '350px'
      }}>
        <div style={{ 
          color: 'var(--accent-cyan)', 
          fontFamily: 'var(--font-mono)', 
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          fontWeight: 'bold'
        }}>
          {progress}%
        </div>
        <div style={{ 
          color: 'var(--text-primary)', 
          fontSize: '0.9rem',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {phases[phaseIndex]}
        </div>
      </div>
    </div>
  );
};

export default LoadingScanner;
