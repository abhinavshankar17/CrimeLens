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
    <div className="grid-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Intelligence Dashboard</h1>
          <p className="page-subtitle">Platform-wide analytics and threat metrics.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="glass-card stat-card">
          <div className="stat-header">Total Analyses</div>
          <div className="stat-value">{countTotal}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-header">Average Threat Score</div>
          <div className="stat-value" style={{ color: stats.averageThreatScore > 60 ? 'var(--threat-high)' : 'var(--threat-medium)' }}>
            {stats.averageThreatScore}
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-header">Critical Alerts</div>
          <div className="stat-value" style={{ color: 'var(--threat-critical)' }}>
            {stats.threatDistribution.CRITICAL || 0}
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-header">Recent Incidents</div>
          <div className="stat-value">{stats.recentAnalyses.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Threat Distribution */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Threat Level Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Objects */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Top Detected Objects</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topDetectedObjects} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#a0a0b8" />
                <YAxis dataKey="class" type="category" stroke="#a0a0b8" style={{textTransform: 'capitalize'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }} />
                <Bar dataKey="count" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
