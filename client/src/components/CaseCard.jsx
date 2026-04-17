import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Clock } from 'lucide-react';

const CaseCard = ({ c }) => {
  const navigate = useNavigate();

  const firstAnalysis = c.analyses && c.analyses.length > 0 ? c.analyses[0] : null;

  return (
    <div 
      className="glass-card case-card-hover" 
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid var(--glass-border)'
      }}
      onClick={() => navigate(`/cases/${c._id}`)}
    >
      {/* Evidence Image Preview */}
      <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        {firstAnalysis?.imageUrl ? (
          <img 
            src={firstAnalysis.imageUrl} 
            alt="Evidence Detail" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Paperclip size={32} style={{ opacity: 0.3 }} />
          </div>
        )}
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          display: 'flex', 
          gap: '8px' 
        }}>
          <span className={`badge badge-${c.priority === 'critical' ? 'critical' : c.priority === 'high' ? 'high' : 'medium'}`}>
            {c.priority}
          </span>
        </div>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {c.title}
          </h3>
        </div>

        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem', 
          lineHeight: '1.5',
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}>
          {c.description || "Forensic case details pending analysis."}
        </p>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--glass-border)', 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Paperclip size={14} />
              {c.analyses?.length || 0} Evidence
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} />
              {new Date(c.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span style={{ 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px', 
            fontSize: '0.7rem', 
            fontWeight: '700',
            color: c.status === 'closed' ? 'var(--success)' : c.status === 'investigating' ? 'var(--warning)' : 'var(--text-muted)'
          }}>
            {c.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
