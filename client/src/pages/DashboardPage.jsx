import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { analysisService } from '../services/api';

const COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  MINIMAL: '#06b6d4'
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animated counters
  const [countTotal, setCountTotal] = useState(0);

  useEffect(() => {
    analysisService.getStats()
      .then(res => {
        setStats(res.data);
        
        // Count animation
        let start = 0;
        const total = res.data.totalAnalyses || 0;
        if (total > 0) {
          const timer = setInterval(() => {
            start += Math.ceil(total / 20);
            if (start >= total) {
              setCountTotal(total);
              clearInterval(timer);
            } else {
              setCountTotal(start);
            }
          }, 50);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="grid-container">Loading...</div>;
  }

  // Format Recharts data
  const threatData = Object.entries(stats.threatDistribution).map(([name, value]) => ({
    name, value
  })).filter(d => d.value > 0);

  return (
    <div className="grid-container animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Forensic Intelligence Dashboard</h1>
          <p className="page-subtitle">Real-time crime analytics and homicide case metrics across the jurisdiction.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Evidence</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{countTotal}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--threat-high)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Avg. Threat Score</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: stats.averageThreatScore > 70 ? 'var(--threat-critical)' : 'var(--threat-high)' }}>
            {stats.averageThreatScore}%
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--threat-critical)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Active Homicides</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--threat-critical)' }}>
            {stats.threatDistribution.CRITICAL || 0}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Analytic Patterns</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.recentAnalyses.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Threat Distribution */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--threat-critical)' }}></div>
             Threat Severity Profile
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#12121a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {threatData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[d.name] }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Objects */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
            Detected Forensic Elements
          </h3>
          <div style={{ height: '380px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topDetectedObjects} layout="vertical" margin={{ left: 20, right: 30, top: 20, bottom: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="class" 
                  type="category" 
                  stroke="#a0a0b8" 
                  fontSize={12}
                  width={100}
                  tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ background: '#12121a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
