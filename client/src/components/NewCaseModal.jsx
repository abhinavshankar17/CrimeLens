import React, { useState, useRef } from 'react';
import { X, ShieldAlert, FileText, BarChart, Image as ImageIcon, Camera, PlusCircle, Trash2 } from 'lucide-react';

const NewCaseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [evidenceItems, setEvidenceItems] = useState([
    { file: null, preview: null, description: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef([]);

  if (!isOpen) return null;

  const handleAddEvidence = () => {
    setEvidenceItems([...evidenceItems, { file: null, preview: null, description: '' }]);
  };

  const handleRemoveEvidence = (index) => {
    const newItems = [...evidenceItems];
    newItems.splice(index, 1);
    setEvidenceItems(newItems);
  };

  const handleEvidenceChange = (index, field, value) => {
    const newItems = [...evidenceItems];
    newItems[index][field] = value;
    if (field === 'file') {
      newItems[index].preview = URL.createObjectURL(value);
    }
    setEvidenceItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('priority', formData.priority);
    
    evidenceItems.forEach((item) => {
      if (item.file) {
        data.append('images', item.file);
        data.append('evidenceDescriptions', item.description || '');
      }
    });

    try {
      await onSuccess(data);
      onClose();
      resetForm();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Forensic Intake Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'medium' });
    setEvidenceItems([{ file: null, preview: null, description: '' }]);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem'
    }}>
      <div 
        className="glass-card animate-slide-up" 
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2.5rem',
          position: 'relative',
          border: '1px solid var(--glass-border)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert className="text-gradient" size={28} />
          Create New Investigation
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                 Case Title
              </label>
              <input 
                required
                className="input-base"
                placeholder="Residential Homicide #742..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Priority Level
              </label>
              <select 
                className="input-base"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Initial Case Brief</label>
            <textarea 
              className="input-base"
              rows="2"
              placeholder="Primary investigative findings..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Evidence Collection */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <ImageIcon size={18} className="text-gradient" /> Evidence Collection
                </h3>
                <button 
                  type="button" 
                  onClick={handleAddEvidence}
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}
                >
                   <PlusCircle size={16} /> Add Evidence
                </button>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {evidenceItems.map((item, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                    {evidenceItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEvidence(idx)}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', opacity: 0.6 }}
                      >
                         <Trash2 size={16} />
                      </button>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
                      <div 
                        onClick={() => fileInputRefs.current[idx].click()}
                        style={{
                          height: '140px',
                          border: '2px dashed var(--glass-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.2)'
                        }}
                      >
                        {item.preview ? (
                          <img src={item.preview} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Camera size={24} style={{ color: 'var(--text-muted)' }} />
                        )}
                        <input 
                          type="file" 
                          hidden 
                          ref={el => fileInputRefs.current[idx] = el}
                          onChange={(e) => handleEvidenceChange(idx, 'file', e.target.files[0])}
                          accept="image/*"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Forensic Description</label>
                        <textarea 
                          className="input-base"
                          placeholder="Individual evidence notes..."
                          style={{ height: '108px' }}
                          value={item.description}
                          onChange={(e) => handleEvidenceChange(idx, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Discard
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: '12px' }}>
              {loading ? 'Processing Evidence...' : 'Create Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCaseModal;
