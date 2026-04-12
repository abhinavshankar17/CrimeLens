import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

const ImageUploader = ({ onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    if (!uploadedFile.type.startsWith('image/')) return;
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const submit = () => {
    if (file) {
      onUpload(file, preview);
    }
  };

  const cancel = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!preview ? (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragActive ? 'rgba(0, 212, 255, 0.05)' : 'transparent'
          }}
          onClick={() => document.getElementById('fileUpload').click()}
        >
          <UploadCloud size={64} color={isDragActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: isDragActive ? 'var(--accent-cyan)' : 'var(--text-primary)'}}>
            Drop crime scene image or click to upload
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Supports: JPG, PNG, WEBP (Max 10MB)</p>
          <input 
            type="file" 
            id="fileUpload" 
            style={{ display: 'none' }} 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleChange} 
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img src={preview} alt="Upload preview" style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '500px' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={submit} style={{ padding: '12px 32px' }}>
              Analyze Scene
            </button>
            <button 
              onClick={cancel} 
              style={{ padding: '12px 32px', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
