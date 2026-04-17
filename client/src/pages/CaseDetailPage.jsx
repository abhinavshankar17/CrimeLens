import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseService } from '../services/api';
import { Clock, Paperclip, MessageSquare, Shield, ChevronLeft, MapPin, AlertTriangle } from 'lucide-react';

const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await caseService.getById(id);
      setCaseData(res.data.case);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="grid-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner"></div>
    </div>
  );

  if (!caseData) return (
    <div className="grid-container">
      <button onClick={() => navigate('/cases')} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        <ChevronLeft size={18} /> Back to Cases
      </button>
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Case not found</h2>
      </div>
    </div>
  );

  return (
    <div className="grid-container">
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/cases')} 
            style={{ padding: '10px', borderRadius: '50%', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 className="page-title" style={{ marginBottom: 0 }}>{caseData.title}</h1>
              <span className={`badge badge-${caseData.priority}`}>
                {caseData.priority}
              </span>
            </div>
            <p className="page-subtitle">Investigation started on {new Date(caseData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="input-base" 
            style={{ width: 'auto' }}
            value={caseData.status}
            onChange={async (e) => {
              try {
                await caseService.update(id, { status: e.target.value });
                fetchCase();
              } catch (err) { console.error(err); }
            }}
          >
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Evidence & Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Paperclip className="text-gradient" size={24} />
              <h2 style={{ fontSize: '1.5rem' }}>Forensic Evidence ({caseData.analyses?.length || 0})</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {caseData.analyses?.map((analysis) => (
                <div 
                  key={analysis._id} 
                  className="glass-card"
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                    <img 
                      src={analysis.imageUrl} 
                      alt="Crime Scene" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span className={`badge badge-${analysis.threatLevel?.toLowerCase() || 'low'}`}>
                        {analysis.threatLevel}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ID: {analysis._id.substring(18)}
                      </div>
                      <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                        Score: {analysis.threatScore}%
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {analysis.forensicReport?.sceneOverview}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {analysis.detections?.slice(0, 3).map((d, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          {d.class}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Metadata & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Card */}
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--gradient-card)' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Case Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} />
                <span style={{ fontSize: '0.9rem' }}>Last Updated: {new Date(caseData.updatedAt).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Shield size={16} />
                <span style={{ fontSize: '0.9rem' }}>Assigned AI Agent: Kovera-Alpha v2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} />
                <span style={{ fontSize: '0.9rem' }}>Jurisdiction: Sector-7G</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <MessageSquare className="text-gradient" size={20} />
              <h3 style={{ fontSize: '1.25rem' }}>Case Notes</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {caseData.notes?.map((note, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{note.content}</p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} className="mono">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
              
              <div style={{ marginTop: '1rem' }}>
                <textarea 
                  className="input-base" 
                  placeholder="Add investigator note..."
                  rows="3"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!e.target.value.trim()) return;
                      try {
                        await caseService.addNote(id, e.target.value);
                        e.target.value = '';
                        fetchCase();
                      } catch (err) { console.error(err); }
                    }
                  }}
                ></textarea>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Press Enter to save note.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage;
