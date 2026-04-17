import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import AnnotatedViewer from '../components/AnnotatedViewer';
import DetectionList from '../components/DetectionList';
import ThreatMeter from '../components/ThreatMeter';
import ForensicReport from '../components/ForensicReport';
import LoadingScanner from '../components/LoadingScanner';
import { analysisService } from '../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CaseReportPDF from '../components/CaseReportPDF';
import { FileDown, Plus } from 'lucide-react';


const AnalyzePage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  
  // State for hovering over a list item to highlight box
  const [hoveredDetection, setHoveredDetection] = useState(null);

  const handleUpload = async (uploadedFile, preview) => {
    setFile(uploadedFile);
    setPreviewUrl(preview);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const res = await analysisService.analyze(formData);
      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || err.message;
      setError(`Failed to analyze image: ${serverMessage}. Ensure the backend is running and you are logged in.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="grid-container" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', minHeight: 'calc(100vh - 70px)' }}>
      {/* Left Panel: Upload & Detection */}
      <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Forensic Analysis</h1>
            <p className="page-subtitle">Upload scene imagery for instant automated assessment.</p>
          </div>
          {analysisResult && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <PDFDownloadLink 
                document={<CaseReportPDF data={analysisResult} imageUrl={previewUrl} />} 
                fileName={`Forensic_Report_${new Date().getTime()}.pdf`}
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                {({ loading }) => (
                  <>
                    <FileDown size={18} />
                    {loading ? 'Preparing Report...' : 'Download Report'}
                  </>
                )}
              </PDFDownloadLink>
              <button 
                className="btn-glass" 
                onClick={handleReset}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s'
                }}
              >
                <Plus size={18} />
                New Analysis
              </button>
            </div>
          )}
        </div>


        {error && (
          <div style={{ padding: '1rem', background: 'var(--threat-critical)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {!previewUrl && !isAnalyzing && !analysisResult && (
          <ImageUploader onUpload={handleUpload} />
        )}

        {isAnalyzing && (
          <LoadingScanner imageUrl={previewUrl} />
        )}

        {analysisResult && (
          <>
            <AnnotatedViewer 
              imageUrl={previewUrl} 
              detections={analysisResult.detections} 
              hoveredDetection={hoveredDetection} 
            />
            <DetectionList 
              detections={analysisResult.detections} 
              onHoverDetection={setHoveredDetection} 
            />
          </>
        )}
      </div>

      {/* Right Panel: Intelligence */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {!analysisResult && !isAnalyzing && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Waiting for input...
          </div>
        )}

        {isAnalyzing && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {analysisResult && (
          <>
            <ThreatMeter 
              score={analysisResult.threatScore} 
              level={analysisResult.threatLevel} 
            />
            <ForensicReport report={analysisResult.forensicReport} />
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: var(--accent-cyan) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}} />
    </div>

  );
};

export default AnalyzePage;
