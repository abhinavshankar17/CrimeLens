import React, { useState } from 'react';
import { 
  UserSearch, AlertTriangle, MapPin, Crosshair, Fingerprint, 
  ChevronDown, Shield, Swords, Clock, Eye, Lock, Radio,
  Skull
} from 'lucide-react';

const statusConfig = {
  wanted: { label: 'WANTED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  released: { label: 'RELEASED', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' },
  under_surveillance: { label: 'SURVEILLED', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' },
  incarcerated: { label: 'INCARCERATED', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.4)' }
};

const dangerConfig = {
  extreme: { label: 'EXTREME', color: '#ef4444', width: '100%' },
  high: { label: 'HIGH', color: '#f97316', width: '75%' },
  moderate: { label: 'MODERATE', color: '#eab308', width: '50%' },
  low: { label: 'LOW', color: '#22c55e', width: '25%' }
};

const factorIcons = {
  'Crime Type': Crosshair,
  'Weapon Match': Swords,
  'MO Pattern': Fingerprint,
  'Proximity': MapPin,
  'Status': Radio
};

const SuspectCard = ({ suspect, rank, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { criminal, matchScore, matchReasons } = suspect;
  const status = statusConfig[criminal.status] || statusConfig.wanted;
  const danger = dangerConfig[criminal.dangerLevel] || dangerConfig.moderate;

  return (
    <div 
      className="animate-slide-up"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${rank === 1 ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        animationDelay: `${index * 0.15}s`,
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Rank indicator stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
        background: rank === 1 ? 'var(--gradient-danger)' : rank <= 3 ? 'var(--gradient-primary)' : 'var(--glass-border)'
      }} />

      {/* Main card content */}
      <div style={{ padding: '1rem 1rem 1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          {/* Mugshot */}
          <div style={{ position: 'relative', flex: '0 0 auto' }}>
            <img 
              src={criminal.photo} 
              alt={criminal.name}
              style={{
                width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover',
                border: `2px solid ${status.border}`,
                filter: 'contrast(1.1)'
              }}
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(criminal.name)}&background=1a1a2e&color=f0f0f5&size=56`; }}
            />
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${rank === 1 ? '#ef4444' : 'var(--accent-cyan)'}`,
              fontSize: '0.6rem', fontWeight: 'bold', color: rank === 1 ? '#ef4444' : 'var(--accent-cyan)'
            }}>
              #{rank}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {criminal.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  aka "{criminal.alias}" · {criminal.age}y/o · {criminal.gender}
                </div>
              </div>
              
              {/* Status Badge */}
              <span style={{
                padding: '2px 8px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 700,
                background: status.bg, color: status.color, border: `1px solid ${status.border}`,
                letterSpacing: '0.5px', whiteSpace: 'nowrap', textTransform: 'uppercase'
              }}>
                {status.label}
              </span>
            </div>

            {/* Match Score Bar */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Match Probability
                </span>
                <span style={{ 
                  fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                  color: matchScore >= 60 ? '#ef4444' : matchScore >= 40 ? '#f97316' : '#eab308'
                }}>
                  {matchScore}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px', transition: 'width 1s ease',
                  width: `${matchScore}%`,
                  background: matchScore >= 60 ? 'var(--gradient-danger)' : 'var(--gradient-primary)'
                }} />
              </div>
            </div>

            {/* Match Factors (icons) */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {matchReasons.map((reason, i) => {
                const FactorIcon = factorIcons[reason.factor] || Shield;
                return (
                  <div key={i} title={`${reason.factor}: ${reason.detail}`} style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem',
                    background: 'rgba(0, 212, 255, 0.08)', color: 'var(--accent-cyan)',
                    border: '1px solid rgba(0, 212, 255, 0.15)'
                  }}>
                    <FactorIcon size={10} />
                    {reason.factor}
                  </div>
                );
              })}
            </div>

            {/* Danger Level */}
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Danger:
              </span>
              <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: danger.width, background: danger.color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: danger.color }}>{danger.label}</span>
            </div>
          </div>
        </div>

        {/* Expand Toggle */}
        <button 
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', marginTop: '0.5rem', padding: '4px', borderRadius: '4px',
            background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            fontSize: '0.65rem', cursor: 'pointer', transition: 'all 0.2s',
            border: '1px solid transparent'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          {expanded ? 'Hide Details' : 'View Criminal Record'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          padding: '0 1rem 1rem 1.25rem', 
          borderTop: '1px solid var(--glass-border)',
          animation: 'slide-in-bottom 0.3s ease'
        }}>
          {/* Match Breakdown */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Match Breakdown
            </div>
            {matchReasons.map((reason, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{reason.detail}</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  +{reason.weight}pts
                </span>
              </div>
            ))}
          </div>

          {/* Past Crimes Timeline */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Criminal History ({criminal.knownCrimes?.length || 0} offenses)
            </div>
            {criminal.knownCrimes?.map((crime, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.5rem', padding: '6px 0',
                borderBottom: i < criminal.knownCrimes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', marginTop: '5px', flex: '0 0 auto',
                  background: crime.convicted ? '#ef4444' : '#eab308'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {crime.crimeType}
                    <span style={{
                      marginLeft: '6px', fontSize: '0.55rem', padding: '1px 5px', borderRadius: '3px',
                      background: crime.convicted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: crime.convicted ? '#ef4444' : '#eab308'
                    }}>
                      {crime.convicted ? 'CONVICTED' : 'SUSPECTED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {crime.description}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={8} />
                    {crime.date ? new Date(crime.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MO + Weapons */}
          {(criminal.modusOperandi?.length > 0 || criminal.associatedWeapons?.length > 0) && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {criminal.modusOperandi?.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Modus Operandi
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {criminal.modusOperandi.map((mo, i) => (
                      <span key={i} style={{
                        padding: '2px 6px', borderRadius: '3px', fontSize: '0.6rem',
                        background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple)',
                        border: '1px solid rgba(124, 58, 237, 0.2)'
                      }}>{mo}</span>
                    ))}
                  </div>
                </div>
              )}
              {criminal.associatedWeapons?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Known Weapons
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {criminal.associatedWeapons.map((w, i) => (
                      <span key={i} style={{
                        padding: '2px 6px', borderRadius: '3px', fontSize: '0.6rem',
                        background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.25)'
                      }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Physical Description */}
          {criminal.physicalDescription && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Physical Description
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {criminal.physicalDescription.height && <span>Height: {criminal.physicalDescription.height}</span>}
                {criminal.physicalDescription.weight && <span>Weight: {criminal.physicalDescription.weight}</span>}
              </div>
              {criminal.physicalDescription.distinguishingMarks?.length > 0 && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Marks: {criminal.physicalDescription.distinguishingMarks.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const SuspectProfiler = ({ suspects, loading }) => {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UserSearch size={18} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Suspect Profiler</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cross-referencing criminal database...</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid rgba(239, 68, 68, 0.15)', borderTopColor: '#ef4444',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: suspects?.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${suspects?.length > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`
        }}>
          {suspects?.length > 0 
            ? <Skull size={18} color="#ef4444" /> 
            : <Shield size={18} color="#22c55e" />
          }
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Suspect Profiler</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {suspects?.length > 0 
              ? `${suspects.length} potential culprit${suspects.length > 1 ? 's' : ''} identified from criminal records`
              : 'No matching suspects found in database'
            }
          </p>
        </div>
        {suspects?.length > 0 && (
          <div style={{
            marginLeft: 'auto', padding: '4px 10px', borderRadius: '100px',
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '0.65rem', fontWeight: 700, color: '#ef4444',
            animation: 'pulse-alert 2s ease-in-out infinite'
          }}>
            <AlertTriangle size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {suspects.length} MATCH{suspects.length > 1 ? 'ES' : ''}
          </div>
        )}
      </div>

      {/* Suspect List */}
      {suspects?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {suspects.map((suspect, i) => (
            <SuspectCard key={suspect.criminal._id} suspect={suspect} rank={i + 1} index={i} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '2rem', textAlign: 'center', color: 'var(--text-muted)',
          background: 'rgba(34, 197, 94, 0.03)', borderRadius: 'var(--radius-md)',
          border: '1px dashed rgba(34, 197, 94, 0.2)'
        }}>
          <Shield size={32} color="#22c55e" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e' }}>No Suspects Matched</div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Crime profile did not match any known criminals in the database.
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-alert {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
};

export default SuspectProfiler;
