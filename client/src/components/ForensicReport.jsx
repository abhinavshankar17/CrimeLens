import React, { useState } from 'react';
import { Search, List, AlertTriangle, Brain, ShieldAlert, CheckSquare, ChevronDown } from 'lucide-react';

const ReportSection = ({ title, icon: Icon, children, defaultOpen = true, index }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div 
      className="animate-slide-up" 
      style={{ 
        marginBottom: '1rem', 
        border: '1px solid var(--glass-border)', 
        borderRadius: 'var(--radius-md)', 
        overflow: 'hidden',
        animationDelay: `${index * 0.1}s`,
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
          <Icon size={18} color="var(--accent-cyan)" />
          {title}
        </div>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      
      {isOpen && (
        <div style={{ padding: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const ForensicReport = ({ report }) => {
  if (!report) return null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Forensic Report
        <span className="badge badge-minimal" style={{ fontSize: '0.8rem' }}>Confidence: {report.confidence}%</span>
      </h2>
      
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
        <ReportSection title="Scene Overview" icon={Search} index={0}>
          {report.sceneOverview}
        </ReportSection>

        <ReportSection title="Detected Elements" icon={List} index={1}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {report.detectedElements?.map((el, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{el}</li>)}
          </ul>
        </ReportSection>

        <ReportSection title="Anomaly Analysis" icon={AlertTriangle} index={2}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {report.anomalyAnalysis?.map((el, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{el}</li>)}
          </ul>
        </ReportSection>

        <ReportSection title="Forensic Interpretation" icon={Brain} index={3}>
          {report.forensicInterpretation}
        </ReportSection>

        <ReportSection title="Risk Factors" icon={ShieldAlert} index={4}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {report.threatAssessment?.factors?.map((el, i) => <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--threat-high)' }}>{el}</li>)}
          </ul>
        </ReportSection>

        <ReportSection title="Recommended Actions" icon={CheckSquare} index={5}>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {report.recommendedActions?.map((el, i) => <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>{el}</li>)}
          </ul>
        </ReportSection>
      </div>
    </div>
  );
};

export default ForensicReport;
