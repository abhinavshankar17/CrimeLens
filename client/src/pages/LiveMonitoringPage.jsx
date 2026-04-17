import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Shield, AlertTriangle, Play, Square, Eye, Radio, Terminal, History, Camera, RefreshCw } from 'lucide-react';


import { analysisService } from '../services/api';

const LiveMonitoringPage = () => {
  const webcamRef = useRef(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('Standby');
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [scanInterval, setScanInterval] = useState(3000);

  const handleDevices = useCallback((mediaDevices) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
    setDevices(videoDevices);
    if (videoDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const videoConstraints = selectedDeviceId 
    ? { width: 1280, height: 720, deviceId: { exact: selectedDeviceId } }
    : { width: 1280, height: 720, facingMode: { ideal: facingMode } };

  const refreshDevices = () => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  };



  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };


  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || isProcessing) return;

    const rawSrc = webcamRef.current.getScreenshot();
    if (!rawSrc) return;

    setIsProcessing(true);
    setStatus('Analyzing Frame...');

    try {
      // Efficiency: Downscale frame locally to 640px before sending to reduce latency
      const img = new Image();
      img.src = rawSrc;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      const scale = 640 / img.width;
      canvas.width = 640;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const downscaledSrc = canvas.toDataURL('image/jpeg', 0.8);

      const blob = dataURItoBlob(downscaledSrc);
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const res = await analysisService.monitor(formData);
      const result = res.data;


      setLastScanResult(result);

      if (result.alert) {
        setAlerts(prev => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: result.crimeType,
            description: result.description,
            confidence: result.confidence,
            action: result.recommendedAction
          },
          ...prev.slice(0, 9)
        ]);
        setStatus('THREAT DETECTED');
      } else {
        setStatus(`Clear — ${result.description || result.crimeType || 'Scanning...'}`);
      }

    } catch (err) {
      console.error('Monitoring scan error:', err);
      const msg = err.response?.data?.error || err.message;
      setStatus(`Scan Failed: ${msg}`);
    } finally {

      setIsProcessing(false);
    }
  }, [isProcessing]);

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        captureAndAnalyze();
      }, scanInterval);
    } else {
      clearInterval(interval);
      setStatus('Standby');
    }
    return () => clearInterval(interval);
  }, [isMonitoring, captureAndAnalyze, scanInterval]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setAlerts([]);
    }
  };

  return (
    <div className="grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 100px)' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Intelligence</h1>
          <p className="page-subtitle">Real-time behavior analysis and threat detection.</p>
        </div>
        <button 
          className={isMonitoring ? 'btn-danger' : 'btn-primary'} 
          onClick={toggleMonitoring}
          style={{ 
            background: isMonitoring ? 'var(--threat-critical)' : 'var(--gradient-primary)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}
        >
          {isMonitoring ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {isMonitoring ? 'Stop Monitoring' : 'Start Feed'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', flex: 1 }}>
        {/* Feed View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '0.5rem', background: '#000' }}>
            {/* HUD Overlays */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="badge" style={{ background: isMonitoring ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 100, 100, 0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem' }}>
                <Radio size={12} className={isMonitoring ? 'pulse' : ''} style={{ marginRight: '4px' }} />
                {isMonitoring ? 'LIVE FEED DATA' : 'OFFLINE'}
              </div>
              <div className="badge" style={{ background: 'rgba(0,0,0,0.5)', color: '#00d4ff', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                REC: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, display: 'flex', gap: '0.4rem' }}>
              {devices.length > 0 && (
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <select 
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    style={{ 
                      background: 'transparent', 
                      color: '#fff', 
                      border: 'none',
                      fontSize: '0.7rem', 
                      padding: '4px 8px',
                      outline: 'none',
                      cursor: 'pointer',
                      width: '120px'
                    }}
                  >
                    {devices.map((device, key) => (
                      <option key={key} value={device.deviceId} style={{ background: '#222' }}>
                        {device.label || `Camera ${key + 1}`}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={refreshDevices}
                    style={{ padding: '0 8px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}
                    title="Refresh Device List"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              )}

              <button 
                onClick={toggleCamera}
                style={{ background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}
                title="Switch Facing (Mobile)"
              >
                <Camera size={14} /> {facingMode === 'user' ? 'Rear' : 'Front'}
              </button>
              <div style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', borderLeft: `3px solid ${status.includes('THREAT') ? 'var(--threat-critical)' : 'var(--accent-cyan)'}`, color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                STATUS: {status}
              </div>
            </div>



            {/* Target Area Overlay */}
            {isMonitoring && (
              <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', border: '1px dashed rgba(0, 212, 255, 0.2)', pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: -5, left: -5, width: 20, height: 20, borderTop: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)' }} />
                <div style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderTop: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)' }} />
                <div style={{ position: 'absolute', bottom: -5, left: -5, width: 20, height: 20, borderBottom: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)' }} />
                <div style={{ position: 'absolute', bottom: -5, right: -5, width: 20, height: 20, borderBottom: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)' }} />
              </div>
            )}

            <Webcam
              key={selectedDeviceId}
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '400px',
                borderRadius: '8px',
                opacity: isMonitoring ? 1 : 0.3,
                transition: 'opacity 0.5s'
              }}
            />


          </div>

          {/* Current Frame Intelligence */}
          <div className="glass-card" style={{ padding: '1rem', flex: 1, borderLeft: `4px solid ${lastScanResult?.alert ? 'var(--threat-critical)' : 'var(--accent-cyan)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Terminal size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Analysis Log</h3>
            </div>
            {lastScanResult ? (
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {lastScanResult.description || 'System scanning for suspicious activities...'}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CONFIDENCE:</span>
                    <div style={{ fontWeight: 'bold' }}>{lastScanResult.confidence}%</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CLASS:</span>
                    <div style={{ fontWeight: 'bold', color: lastScanResult.alert ? 'var(--threat-critical)' : 'var(--accent-cyan)' }}>
                      {lastScanResult.crimeType}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'monospace' }}>RAW INTELLIGENCE FEED:</div>
                  <div style={{ fontSize: '0.7rem', color: '#00d4ff', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
                    {`> Pred: ${lastScanResult.crimeType} | Conf: ${lastScanResult.confidence}% | Alert: ${lastScanResult.alert}`}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Initialize feed to begin real-time analysis.</p>
            )}

          </div>

        </div>

        {/* Alerts & History Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '100%' }}>
          {/* Active Alerts */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color={alerts.length > 0 ? 'var(--threat-critical)' : 'var(--text-muted)'} />
                <h3 style={{ fontSize: '1rem' }}>Threat Alerts</h3>
              </div>
              {alerts.length > 0 && <span className="badge-critical">{alerts.length} New</span>}
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                  <Shield size={32} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.8rem' }}>No active threats detected.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="animate-slide-up" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--threat-critical)', fontWeight: 'bold', fontSize: '0.85rem' }}>{alert.type.toUpperCase()}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{alert.description}</p>
                    <div style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                      <strong>Action:</strong> {alert.action}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Config Panel */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <History size={16} color="var(--text-muted)" />
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Monitoring Parameters</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SCAN INTERVAL (SEC)</label>
                  <span style={{ fontSize: '0.7rem' }}>{scanInterval/1000}s</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="5000" 
                  step="500" 
                  value={scanInterval} 
                  onChange={(e) => setScanInterval(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>THREAT INDEX</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: alerts.length > 5 ? 'var(--threat-critical)' : alerts.length > 0 ? 'var(--threat-medium)' : 'var(--threat-low)' }}>
                    {alerts.length > 5 ? 'High' : alerts.length > 0 ? 'Medium' : 'Nominal'}
                  </div>
                </div>
                <div style={{ flex: 1, padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>FPS LIMIT</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{Math.round(1000/scanInterval)} Hz</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pulse {
          animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default LiveMonitoringPage;
