import React, { useCallback, useState, useRef } from 'react';
import { Film, Play, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { analysisService } from '../services/api';

const VideoUploader = ({ onVideoAnalysis }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frames, setFrames] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) handleVideoFile(e.dataTransfer.files[0]);
  }, []);

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleVideoFile(e.target.files[0]);
  };

  const handleVideoFile = (file) => {
    if (!file.type.startsWith('video/')) return;
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setFrames([]);
    setError(null);
  };

  const extractFrames = () => {
    if (!videoRef.current) return;
    setIsExtracting(true);
    setFrames([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const duration = video.duration;
    
    const numFrames = Math.min(8, Math.max(4, Math.floor(duration / 3)));
    const interval = duration / (numFrames + 1);
    const extracted = [];
    let current = 0;

    const captureNext = () => {
      if (current >= numFrames) {
        setFrames(extracted);
        setIsExtracting(false);
        return;
      }
      video.currentTime = interval * (current + 1);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      extracted.push({
        id: current,
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        timestamp: video.currentTime,
        label: formatTime(video.currentTime),
        status: 'pending',
        result: null
      });

      current++;
      captureNext();
    };

    captureNext();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  // Convert data URL to File
  const dataUrlToFile = (dataUrl, name) => {
    const [meta, data] = dataUrl.split(',');
    const mime = meta.split(':')[1].split(';')[0];
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], name, { type: mime });
  };

  // Analyze ALL frames sequentially
  const analyzeAllFrames = async () => {
    if (frames.length === 0) return;
    setIsAnalyzing(true);
    setError(null);

    const total = frames.length;
    setProgress({ current: 0, total });

    const results = [];
    const updatedFrames = [...frames];

    for (let i = 0; i < total; i++) {
      const frame = updatedFrames[i];
      frame.status = 'analyzing';
      setFrames([...updatedFrames]);
      setProgress({ current: i + 1, total });

      try {
        const file = dataUrlToFile(frame.dataUrl, `frame_${frame.label}.jpg`);
        const formData = new FormData();
        formData.append('image', file);

        const res = await analysisService.analyze(formData);
        frame.status = 'done';
        frame.result = res.data;
        results.push({ ...res.data, frameIndex: i, timestamp: frame.label, frameImage: frame.dataUrl });
      } catch (err) {
        console.error(`Frame ${i} analysis failed:`, err);
        frame.status = 'failed';
        frame.result = null;
      }

      setFrames([...updatedFrames]);
    }

    setIsAnalyzing(false);

    // Aggregate results
    if (results.length > 0) {
      const aggregated = aggregateResults(results);
      onVideoAnalysis(aggregated);
    } else {
      setError('All frame analyses failed. Check your API key limits.');
    }
  };

  // Combine multiple frame analyses into one cohesive report
  const aggregateResults = (results) => {
    // Find the highest threat
    const sorted = [...results].sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));
    const peak = sorted[0];

    // Collect all unique detections
    const allDetections = [];
    const seenClasses = new Set();
    results.forEach(r => {
      (r.detections || []).forEach(d => {
        const key = `${d.class}-${Math.round(d.confidence * 10)}`;
        if (!seenClasses.has(key)) {
          seenClasses.add(key);
          allDetections.push(d);
        }
      });
    });

    // Merge forensic reports
    const allOverviews = results.map((r, i) => `[${r.timestamp}] ${r.forensicReport?.sceneOverview || ''}`).filter(Boolean);
    const allElements = [...new Set(results.flatMap(r => r.forensicReport?.detectedElements || []))];
    const allAnomalies = [...new Set(results.flatMap(r => r.forensicReport?.anomalyAnalysis || []))];
    const allActions = [...new Set(results.flatMap(r => r.forensicReport?.recommendedActions || []))].slice(0, 6);
    const allCrimeTypes = [...new Set(results.map(r => r.forensicReport?.crimeType).filter(Boolean))];

    return {
      isVideoAnalysis: true,
      frameResults: results,
      detections: allDetections,
      threatScore: peak.threatScore,
      threatLevel: peak.threatLevel,
      forensicReport: {
        sceneOverview: `Video analysis across ${results.length} key frames. ` + allOverviews.join(' '),
        detectedElements: allElements,
        anomalyAnalysis: allAnomalies,
        forensicInterpretation: peak.forensicReport?.forensicInterpretation || 'Analysis complete.',
        threatAssessment: peak.forensicReport?.threatAssessment || { level: 'LOW', score: 0, factors: [] },
        recommendedActions: allActions,
        crimeType: allCrimeTypes.join(', ') || 'None',
        confidence: peak.forensicReport?.confidence || 0
      }
    };
  };

  const reset = () => {
    setVideoFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setFrames([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const statusIcon = (status) => {
    if (status === 'analyzing') return <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-cyan)" />;
    if (status === 'done') return <CheckCircle size={14} color="var(--accent-green)" />;
    if (status === 'failed') return <AlertTriangle size={14} color="var(--threat-critical)" />;
    return <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--glass-border)' }} />;
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Film size={20} color="var(--accent-purple)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Video Analysis</h3>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', fontWeight: 600 }}>NEW</span>
      </div>

      {!videoUrl ? (
        <div 
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s ease',
            background: isDragActive ? 'rgba(168, 85, 247, 0.05)' : 'transparent'
          }}
          onClick={() => document.getElementById('videoUpload').click()}
        >
          <Film size={48} color={isDragActive ? 'var(--accent-purple)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: isDragActive ? 'var(--accent-purple)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
            Drop video file or click to upload
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Supports: MP4, AVI, MOV, WEBM (Max 50MB)</p>
          <input type="file" id="videoUpload" style={{ display: 'none' }} accept="video/mp4,video/avi,video/quicktime,video/webm" onChange={handleChange} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Video Preview */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} src={videoUrl} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }} controls onLoadedMetadata={extractFrames} muted />
          </div>

          {/* Frame extraction */}
          {isExtracting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', padding: '0.5rem', color: 'var(--accent-purple)' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Extracting key frames...</span>
            </div>
          )}

          {/* Frame grid with status indicators */}
          {frames.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {frames.length} frames extracted
                </p>
                {isAnalyzing && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                    Analyzing {progress.current}/{progress.total}...
                  </p>
                )}
              </div>

              {/* Progress bar */}
              {isAnalyzing && (
                <div style={{ width: '100%', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {frames.map(frame => (
                  <div key={frame.id} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <img src={frame.dataUrl} alt={`Frame ${frame.label}`} style={{ width: '100%', height: '60px', objectFit: 'cover', display: 'block', opacity: frame.status === 'analyzing' ? 0.6 : 1, transition: 'opacity 0.3s' }} />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                      padding: '3px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.6rem', color: '#fff', fontFamily: 'monospace' }}>{frame.label}</span>
                      {statusIcon(frame.status)}
                    </div>
                    {frame.status === 'analyzing' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-cyan)" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--threat-critical)' }}>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={analyzeAllFrames}
              disabled={frames.length === 0 || isAnalyzing || isExtracting}
              style={{ 
                padding: '12px 32px',
                opacity: (frames.length > 0 && !isAnalyzing && !isExtracting) ? 1 : 0.5,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {isAnalyzing ? (
                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing {progress.current}/{progress.total}</>
              ) : (
                <><Play size={16} fill="currentColor" /> Analyze Full Video</>
              )}
            </button>
            <button 
              onClick={reset} 
              disabled={isAnalyzing}
              style={{ padding: '12px 32px', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', opacity: isAnalyzing ? 0.5 : 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VideoUploader;
