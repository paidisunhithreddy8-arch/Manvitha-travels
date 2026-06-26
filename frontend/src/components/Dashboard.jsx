import React, { useState, useEffect } from 'react';

export default function Dashboard({ onAddClick, onEditClick, onViewClick }) {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalReminders: 0,
    activeReminders: 0,
    activeAlertsCount: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Completed' | 'Archived'
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const API_URL = 'https://manvitha-travels.onrender.com/api';

  useEffect(() => {
    fetchData();
  }, [search, activeTab, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let queryParams = `page=${page}&limit=${limit}`;
      if (activeTab !== 'All') {
        queryParams += `&status=${activeTab}`;
      }
      if (search.trim()) {
        queryParams += `&search=${encodeURIComponent(search)}`;
      }

      const remRes = await fetch(`${API_URL}/customer_occasionbased_booking_remi?${queryParams}`);
      const statsRes = await fetch(`${API_URL}/reports/summary`);

      if (remRes.ok && statsRes.ok) {
        const remData = await remRes.json();
        const statsData = await statsRes.json();

        setReminders(remData.data);
        setTotalPages(Math.ceil(remData.pagination.total / limit) || 1);
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/customer_occasionbased_booking_remi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error changing reminder status:', err);
    }
  };

  const formatOccasionType = (type, festival) => {
    if (type === 'birthday') return 'Birthday';
    if (type === 'anniversary') return 'Wedding Anniversary';
    if (type === 'festival') return `Festival (${festival || 'General'})`;
    return type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  };

  return (
    <div>
      {/* 4-Card Stats Summary Row */}
      <div className="metric-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">Total Customers</div>
            <div className="metric-value">{stats.totalCustomers}</div>
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
            <div className="metric-value">{stats.totalReminders}</div>
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
            <div className="metric-value">{stats.activeReminders}</div>
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
            <div className="metric-label">Pending Alerts (7d)</div>
            <div className="metric-value" style={{ textDecoration: stats.activeAlertsCount > 0 ? 'underline' : 'none' }}>
              {stats.activeAlertsCount}
            </div>
          </div>
          <div className="metric-icon metric-icon-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Page header and action button */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Booking Reminder Directory</h1>
          <p className="page-subtitle">Track customer milestones and preferences to trigger booking reminders 7 days prior.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddClick}>
          Create Reminder Rule
        </button>
      </div>

      {/* Filtering and Search Controls */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {['All', 'Active', 'Completed', 'Archived'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
            >
              {tab.toUpperCase()} REMINDERS
            </button>
          ))}
        </div>

        <div className="search-input-box">
          <span className="search-icon-svg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search customer name, details, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Reminders Table */}
      {loading ? (
        <div className="loading-spinner-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="spinner-wheel"></div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading reminder directory...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="empty-state" style={{ borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="empty-state-icon">[EMPTY]</div>
          <h3 className="empty-state-title">No Milestones Found</h3>
          <p className="empty-state-description">
            {search.trim() || activeTab !== 'All'
              ? 'No matching results. Try modifying your filter rules.'
              : 'Register customer profiles and preference rules to initialize occasion tracking.'}
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Occasion Preference</th>
                <th>Occasion Date</th>
                <th>Reminder Date (7d prior)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{r.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {r.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{formatOccasionType(r.occasion_type, r.festival_name)}</div>
                    {r.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Pref: {r.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(r.occasion_date)}</td>
                  <td>
                    <span style={{ color: r.status === 'Active' ? '#ffffff' : 'inherit', fontWeight: r.status === 'Active' ? 600 : 'normal' }}>
                      {formatDate(r.reminder_date)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* Status quick select */}
                      <select
                        className="form-input-field"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: 'auto', border: '1px solid var(--border)' }}
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                      </select>

                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}
                        onClick={() => onViewClick(r.id)}
                      >
                        View
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}
                        onClick={() => onEditClick(r.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Pagination */}
          <div className="pagination-row">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                PREV
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
