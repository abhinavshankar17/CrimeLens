import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Clock } from 'lucide-react';

const CaseCard = ({ c }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-card" 
      style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      onClick={() => navigate(`/cases/${c._id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1.25rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`badge badge-${c.priority === 'critical' ? 'critical' : c.priority === 'high' ? 'high' : 'medium'}`}>
            {c.priority}
          </span>
          <span className={`badge badge-${c.status === 'closed' ? 'low' : c.status === 'open' ? 'minimal' : 'medium'}`}>
            {c.status}
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {c.description || "No description provided."}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Paperclip size={14} />
          {c.analyses?.length || 0} Evidence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={14} />
          {new Date(c.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
