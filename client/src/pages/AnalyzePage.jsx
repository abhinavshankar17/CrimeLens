import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import VideoUploader from '../components/VideoUploader';
import AnnotatedViewer from '../components/AnnotatedViewer';
import DetectionList from '../components/DetectionList';
import ThreatMeter from '../components/ThreatMeter';
import ForensicReport from '../components/ForensicReport';
import SuspectProfiler from '../components/SuspectProfiler';
import LoadingScanner from '../components/LoadingScanner';
import { analysisService } from '../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CaseReportPDF from '../components/CaseReportPDF';
import { FileDown, Plus, Film, Clock, AlertTriangle } from 'lucide-react';


const AnalyzePage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredDetection, setHoveredDetection] = useState(null);

  // Video analysis state
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);

  // Suspect profiler state
  const [suspects, setSuspects] = useState(null);
  const [suspectsLoading, setSuspectsLoading] = useState(false);

  // Auto-fetch suspects when analysis completes
  useEffect(() => {
    if (analysisResult?._id && !isVideoMode) {
      setSuspectsLoading(true);
      analysisService.getSuspects(analysisResult._id)
        .then(res => setSuspects(res.data.suspects || []))
        .catch(err => {
          console.error('Failed to load suspects:', err);
          setSuspects([]);
        })
        .finally(() => setSuspectsLoading(false));
    }
  }, [analysisResult?._id, isVideoMode]);

  const handleUpload = async (uploadedFile, preview) => {
    setFile(uploadedFile);
    setPreviewUrl(preview);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setIsVideoMode(false);

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

  const handleVideoAnalysis = (aggregated) => {
    setIsVideoMode(true);
    setAnalysisResult(aggregated);
    // Use the first frame as the preview
    if (aggregated.frameResults?.length > 0) {
      setPreviewUrl(aggregated.frameResults[0].frameImage);
    }
    setSelectedFrameIdx(0);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setIsVideoMode(false);
    setSelectedFrameIdx(0);
    setSuspects(null);
    setSuspectsLoading(false);
  };

  // Get the currently selected frame's data for video mode
  const selectedFrame = isVideoMode && analysisResult?.frameResults?.[selectedFrameIdx];

  const getThreatColor = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'CRITICAL') return 'var(--threat-critical)';
    if (l === 'HIGH') return 'var(--threat-high)';
    if (l === 'MEDIUM') return 'var(--threat-medium)';
    return 'var(--threat-low)';
  };

  return (
    <div className="grid-container" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', minHeight: 'calc(100vh - 70px)' }}>
      {/* Left Panel: Upload & Detection */}
      <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Forensic Analysis</h1>
            <p className="page-subtitle">Upload scene imagery or video for instant automated assessment.</p>
          </div>
          {analysisResult && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <PDFDownloadLink 
                document={<CaseReportPDF data={analysisResult} imageUrl={previewUrl} suspects={suspects} />} 
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
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '12px 24px', borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.3s'
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
          <>
            <ImageUploader onUpload={handleUpload} />
            <VideoUploader onVideoAnalysis={handleVideoAnalysis} />
          </>
        )}

        {isAnalyzing && (
          <LoadingScanner imageUrl={previewUrl} />
        )}

        {/* IMAGE MODE results */}
        {analysisResult && !isVideoMode && (
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

        {/* VIDEO MODE results */}
        {analysisResult && isVideoMode && (
          <>
            {/* Frame-by-Frame Timeline */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Film size={18} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '1rem' }}>Video Timeline — {analysisResult.frameResults?.length} Frames Analyzed</h3>
              </div>
              
              {/* Timeline strip */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {analysisResult.frameResults?.map((fr, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setSelectedFrameIdx(i);
                      setPreviewUrl(fr.frameImage);
                    }}
                    style={{
                      flex: '0 0 auto',
                      width: '120px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedFrameIdx === i 
                        ? '2px solid var(--accent-purple)' 
                        : '2px solid transparent',
                      boxShadow: selectedFrameIdx === i 
                        ? '0 0 15px rgba(168, 85, 247, 0.3)' 
                        : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={fr.frameImage} alt={`Frame ${i}`} style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }} />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                        padding: '4px 6px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.6rem', color: '#fff', fontFamily: 'monospace' }}>
                          <Clock size={8} style={{ marginRight: '2px' }} />{fr.timestamp}
                        </span>
                        {(fr.threatLevel === 'CRITICAL' || fr.threatLevel === 'HIGH') && (
                          <AlertTriangle size={10} color="var(--threat-critical)" />
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 6px',
                      background: selectedFrameIdx === i ? 'rgba(168, 85, 247, 0.1)' : 'var(--glass-bg)',
                      fontSize: '0.6rem', color: 'var(--text-muted)'
                    }}>
                      <span style={{ color: getThreatColor(fr.threatLevel), fontWeight: 'bold' }}>
                        {fr.threatLevel}
                      </span>
                      {' · '}{fr.threatScore}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected frame detail */}
            {selectedFrame && (
              <>
                <AnnotatedViewer 
                  imageUrl={selectedFrame.frameImage} 
                  detections={selectedFrame.detections || []} 
                  hoveredDetection={hoveredDetection} 
                />
                <DetectionList 
                  detections={selectedFrame.detections || []} 
                  onHoverDetection={setHoveredDetection} 
                />
              </>
            )}
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
            {isVideoMode && (
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Film size={16} color="var(--accent-purple)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>VIDEO ANALYSIS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frames</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analysisResult.frameResults?.length}</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crime Types</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                      {analysisResult.forensicReport?.crimeType || 'None'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <ThreatMeter 
              score={isVideoMode && selectedFrame ? selectedFrame.threatScore : analysisResult.threatScore} 
              level={isVideoMode && selectedFrame ? selectedFrame.threatLevel : analysisResult.threatLevel} 
            />
            <ForensicReport 
              report={isVideoMode && selectedFrame ? selectedFrame.forensicReport : analysisResult.forensicReport} 
            />
            {!isVideoMode && (
              <SuspectProfiler suspects={suspects} loading={suspectsLoading} />
            )}
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
