import React, { useEffect, useState } from 'react';
import CaseCard from '../components/CaseCard';
import { caseService } from '../services/api';
import { FileQuestion, Plus } from 'lucide-react';
import StatusDropdown from '../components/StatusDropdown';
import NewCaseModal from '../components/NewCaseModal';

const CasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [filterStatus, searchTerm]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await caseService.getAll({
        status: filterStatus || undefined,
        search: searchTerm || undefined
      });
      setCases(res.data.cases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (data) => {
    try {
      await caseService.create(data);
      fetchCases(); // Refresh list
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="grid-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigation Cases</h1>
          <p className="page-subtitle">Manage ongoing criminal investigations and evidence compilation.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Case
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search cases..."
          className="input-base"
          style={{ maxWidth: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <StatusDropdown 
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <span style={{ marginLeft: '1rem' }}>Loading cases...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileQuestion size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
          <h3>No cases found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            {searchTerm || filterStatus
              ? "No cases match your current filters."
              : "Create your first investigation case to link analyses."}
          </p>
          {(searchTerm || filterStatus) && (
            <button
              className="btn-secondary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {cases.map(c => <CaseCard key={c._id} c={c} />)}
        </div>
      )}

      {/* New Case Modal */}
      <NewCaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleCreateCase}
      />
    </div>
  );
};

export default CasesPage;
