import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import PatternAlert from '../components/PatternAlert';
import { analysisService } from '../services/api';

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

const CrimeMapPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default NYC
  const [offset, setOffset] = useState([0, 0]); // [latOffset, lngOffset]

  useEffect(() => {
    // 1. Fetch Location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setMapCenter([userLat, userLng]);
          
          // Calculate offset to mathematically shift our existing NYC-based database to user's locality
          setOffset([userLat - 40.7128, userLng - (-74.0060)]);
        },
        (error) => {
          console.error("Geolocation blocked or failed. Defaulting to NYC.");
        }
      );
    }

    // 2. Fetch Data
    const fetchData = async () => {
      try {
        const [analysisRes, patternRes] = await Promise.all([
          analysisService.getAll({ limit: 100 }), // get enough for map
          analysisService.getPatterns()
        ]);
        setAnalyses(analysisRes.data.analyses);
        setPatterns(patternRes.data.patterns);
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getThreatColor = (level) => {
    switch(level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#06b6d4';
    }
  };

  const applyOffset = (lng, lat) => {
    return [lat + offset[0], lng + offset[1]];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
      {/* Alerts Overlay */}
      <div style={{
        position: 'absolute', top: '90px', left: '20px', right: '20px', zIndex: 1000, pointerEvents: 'none'
      }}>
        {patterns.map((p, i) => (
          <div key={i} style={{ pointerEvents: 'auto', maxWidth: '600px' }}>
            <PatternAlert pattern={p} />
          </div>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
        padding: '1rem 2rem', display: 'flex', gap: '3rem', whiteSpace: 'nowrap'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Incidents</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="mono">{analyses.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Hotspots</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--threat-high)' }} className="mono">{patterns.length}</div>
        </div>
      </div>

      {!loading && (
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <MapUpdater center={mapCenter} />
          {/* Dark map tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {analyses.map(analysis => {
            if (!analysis.location?.coordinates) return null;
            const shiftedCoords = applyOffset(analysis.location.coordinates[0], analysis.location.coordinates[1]);
            return (
              <CircleMarker
                key={analysis._id}
                center={shiftedCoords}
                radius={10}
                pathOptions={{
                  fillColor: getThreatColor(analysis.threatLevel),
                  fillOpacity: 0.8,
                  color: getThreatColor(analysis.threatLevel),
                  weight: 2
                }}
              >
                <Popup>
                  <div style={{ width: '220px', padding: '4px' }}>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <img 
                        src={analysis.imageUrl} 
                        alt="Scene" 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: getThreatColor(analysis.threatLevel)
                      }}>
                        {Math.round(analysis.threatScore)}% THREAT
                      </div>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {analysis.caseId?.title || "Independent Analysis"}
                    </h4>
                    
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${analysis.threatLevel.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {analysis.threatLevel}
                      </span>
                      {analysis.forensicReport?.crimeType && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {analysis.forensicReport.crimeType}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                      {new Date(analysis.createdAt).toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};

export default CrimeMapPage;
