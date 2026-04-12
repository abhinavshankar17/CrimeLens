import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanEye, Brain, Map } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Hero Section */}
      <section style={{ 
        height: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 50%)',
        position: 'relative'
      }}>
        {/* Animated Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: -1
        }} />

        <div className="badge badge-minimal" style={{ marginBottom: '2rem' }}>Forensic Innovation</div>
        <h1 style={{ fontSize: '5rem', marginBottom: '1rem', letterSpacing: '-2px' }}>
          See What <span className="text-gradient">Others Miss</span>
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '800px', 
          lineHeight: '1.6',
          marginBottom: '3rem' 
        }}>
          AI-powered forensic crime scene analysis combining real-time object detection, 
          intelligent scene reasoning, and spatial crime intelligence.
        </p>

        <button 
          className="btn-primary" 
          style={{ padding: '16px 40px', fontSize: '1.1rem' }}
          onClick={() => navigate('/analyze')}
        >
          Start Analysis →
        </button>

        {/* Stats Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '4rem', 
          marginTop: '6rem',
          padding: '2rem',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)'
        }}>
          <div><h3 className="text-gradient" style={{fontSize:'2rem', marginBottom:'0.5rem'}}>50+</h3><span style={{color:'var(--text-muted)'}}>Object Classes</span></div>
          <div><h3 className="text-gradient" style={{fontSize:'2rem', marginBottom:'0.5rem'}}>&lt;100ms</h3><span style={{color:'var(--text-muted)'}}>Detection</span></div>
          <div><h3 className="text-gradient" style={{fontSize:'2rem', marginBottom:'0.5rem'}}>Real-time</h3><span style={{color:'var(--text-muted)'}}>Analysis</span></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid-container" style={{ padding: '6rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Three-Layer Architecture</h2>
          <p style={{ color: 'var(--text-secondary)' }}>The most advanced pipeline in forensic computing.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <ScanEye size={40} color="var(--accent-cyan)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Visual Detection</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Powered by YOLOv8, our engine identifies weapons, vehicles, and critical objects 
              with surgical precision, mapping them spatially.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <Brain size={40} color="var(--accent-purple)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Forensic Reasoning</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Google Gemini evaluates context, lighting, and anomalies to generate 
              professional, narrative forensic interpretations of the scene.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <Map size={40} color="var(--accent-orange)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Crime Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Spatial-temporal heuristics map incidents collectively to unveil hidden clusters
              and emerging threat patterns automatically.
            </p>
          </div>
        </div>
      </section>
      
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
        CrimeLens © 2026 | Built for forensic innovation
      </footer>
    </div>
  );
};

export default LandingPage;
