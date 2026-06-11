import React, { useState, useEffect } from 'react';

export default function ReportsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reports/summary`);
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_URL}/customer_occasionbased_booking_remi?limit=1000`);
      if (!res.ok) return;
      const json = await res.json();
      const reminders = json.data;

      // Build CSV string
      const headers = ['Reminder ID', 'Customer Name', 'Phone', 'Email', 'Occasion Type', 'Festival Name', 'Occasion Date', 'Reminder Date', 'Status', 'Notes', 'Created At'];
      const rows = reminders.map(r => [
        r.id,
        `"${(r.customer_name || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        r.occasion_type,
        `"${(r.festival_name || '').replace(/"/g, '""')}"`,
        r.occasion_date,
        r.reminder_date,
        r.status,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        r.created_at
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `manvitha_booking_reminders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContext: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="spinner-wheel"></div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compiling statistics charts...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Failed to load analytics</h3>
        <button className="btn btn-secondary" onClick={fetchReports}>Retry</button>
      </div>
    );
  }

  // Scale calculations for SVG heights
  const maxMonthlyCount = Math.max(...data.monthlyTrend.map(d => d.count), 1);

  // SVG dimensions
  const chartWidth = 500;
  const chartHeight = 220;
  const padding = 30;

  const points = data.monthlyTrend.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / 11;
    // Calculate Y (inverted for SVG coordinates)
    const y = chartHeight - padding - (d.count / (maxMonthlyCount * 1.2)) * (chartHeight - padding * 2);
    return { x, y, label: d.month, count: d.count };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Executive Reports & Analytics</h1>
          <p className="page-subtitle">Historical monthly trends, status distribution ratios, and data downloads for CRM operations.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          EXPORT REMINDERS (CSV)
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="metric-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">Total Customers</div>
            <div className="metric-value">{data.stats.totalCustomers}</div>
          </div>
          <div className="metric-icon metric-icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Reminder Rules</div>
            <div className="metric-value">{data.stats.totalReminders}</div>
          </div>
          <div className="metric-icon metric-icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Active Monitoring</div>
            <div className="metric-value">{data.stats.activeReminders}</div>
          </div>
          <div className="metric-icon metric-icon-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Triggered Alerts</div>
            <div className="metric-value">{data.stats.activeAlertsCount}</div>
          </div>
          <div className="metric-icon metric-icon-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Trend line chart (SVG Layout) */}
        <div className="svg-chart-box">
          <h3 className="svg-chart-title">Occasion Distribution by Month</h3>
          <div className="chart-container" style={{ minHeight: '220px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="lineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="1.5" />
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#18181b" strokeWidth="1" />

              {/* Shaded area */}
              {points.length > 0 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
                  fill="url(#lineGlow)"
                />
              )}

              {/* Chart line */}
              <path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
              />

              {/* Chart nodes */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#000000"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {p.count > 0 && (
                    <text x={p.x} y={p.y - 8} fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                      {p.count}
                    </text>
                  )}
                  <text x={p.x} y={chartHeight - 12} fill="#a1a1aa" fontSize="9" textAnchor="middle" fontWeight="500">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Status progress blocks */}
        <div className="svg-chart-box">
          <h3 className="svg-chart-title">Status Ratios</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', height: '80%' }}>
            {Object.entries(data.statusDistribution).map(([status, count]) => {
              const total = data.stats.totalReminders || 1;
              const pct = Math.round((count / total) * 100);
              const colorStyle = status === 'Active' ? '#ffffff' 
                : status === 'Completed' ? '#71717a' 
                : '#27272a';
              
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{status.toUpperCase()} REMINDERS</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', backgroundColor: '#27272a', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colorStyle, borderRadius: '99px', transition: 'width 0.4s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Occasion type distribution grid cards */}
      <div className="svg-chart-box" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 className="svg-chart-title">Occasion Category Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {Object.entries(data.occasionTypeDistribution).map(([type, count]) => {
            const total = data.stats.totalReminders || 1;
            const pct = Math.round((count / total) * 100);
            
            const label = type === 'birthday' ? 'Birthdays' : type === 'anniversary' ? 'Wedding Anniversaries' : 'Festivals';
            const shortCode = type === 'birthday' ? 'BDAY' : type === 'anniversary' ? 'ANNI' : 'FEST';
            
            return (
              <div 
                key={type} 
                style={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>[{shortCode}]</div>
                <h4 style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.2rem' }}>{label}</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>{count}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pct}% of preferences</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
