import React, { useEffect, useState } from 'react';
import CaseCard from '../components/CaseCard';
import { caseService } from '../services/api';
import { FileQuestion, Plus } from 'lucide-react';

const CasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.getAll()
      .then(res => setCases(res.data.cases))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigation Cases</h1>
          <p className="page-subtitle">Manage ongoing criminal investigations and evidence compilation.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> New Case
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input type="text" placeholder="Search cases..." className="input-base" style={{ maxWidth: '300px' }} />
        <select className="input-base" style={{ maxWidth: '200px' }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div>Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileQuestion size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
          <h3>No cases found</h3>
          <p style={{ marginTop: '0.5rem' }}>Create your first investigation case to link analyses.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {cases.map(c => <CaseCard key={c._id} c={c} />)}
        </div>
      )}
    </div>
  );
};

export default CasesPage;
