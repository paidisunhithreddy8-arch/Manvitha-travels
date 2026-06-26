import React, { useState, useEffect } from 'react';

export default function DetailView({ reminderId, onBackClick, onEditClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'https://manvitha-travels.onrender.com/api';

  useEffect(() => {
    if (reminderId) {
      fetchDetails();
    }
  }, [reminderId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/customer_occasionbased_booking_remi/${reminderId}/detail`);
      if (res.ok) {
        const detailData = await res.json();
        setData(detailData);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      return date.toLocaleString();
    } catch (e) {
      return dateTimeStr;
    }
  };

  const formatOccasionType = (type, festival) => {
    if (type === 'birthday') return 'Birthday';
    if (type === 'anniversary') return 'Wedding Anniversary';
    if (type === 'festival') return `Festival (${festival || 'General'})`;
    return type;
  };

  if (loading) {
    return (
      <div className="loading-spinner-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="spinner-wheel"></div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading customer booking history...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Reminder Profile Not Found</h3>
        <button className="btn btn-secondary" onClick={onBackClick}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="printable-detail-view">
      {/* Detail header */}
      <div className="page-title-row hide-on-print">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBackClick} style={{ marginBottom: '0.75rem' }}>
            Back to Directory
          </button>
          <h1 className="page-title">{data.customer_name}'s Booking Profile</h1>
          <p className="page-subtitle">Complete contact record, travel preferences, and history logs of notification alerts.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            Print Profile
          </button>
          <button className="btn btn-primary" onClick={() => onEditClick(data.id)}>
            Edit Profile Preferences
          </button>
        </div>
      </div>

      {/* Printable header overlay */}
      <div className="print-only" style={{ display: 'none', marginBottom: '2rem', borderBottom: '2.5px solid #000000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: '#000000' }}>MANIVTHA TOURS & TRAVELS</h1>
        <p style={{ fontSize: '0.9rem', color: '#000000' }}>Customer Occasion-Based Booking Reminder Profile</p>
        <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.25rem' }}>Report Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="profile-detail-panel">
        {/* Main profile card */}
        <div className="profile-card">
          <div>
            <h2 className="profile-section-title">Customer Contact Info</h2>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Customer Name</span>
                <span className="info-value" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>{data.customer_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mobile Number</span>
                <span className="info-value" style={{ display: 'block', color: '#ffffff' }}>{data.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Email Address</span>
                <span className="info-value" style={{ display: 'block', color: '#ffffff' }}>{data.email}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="profile-section-title">Reminder Parameters</h2>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Occasion Category</span>
                <span className="info-value" style={{ display: 'block', color: '#ffffff' }}>{formatOccasionType(data.occasion_type, data.festival_name)}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Occasion Date</span>
                <span className="info-value" style={{ display: 'block', color: '#ffffff' }}>{formatDate(data.occasion_date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Reminder Firing Date</span>
                <span className="info-value" style={{ color: '#ffffff', fontWeight: 600 }}>{formatDate(data.reminder_date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Monitoring Status</span>
                <span className="info-value" style={{ display: 'block' }}>
                  <span className={`badge badge-${data.status.toLowerCase()}`}>
                    {data.status.toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="profile-section-title">Travel Preferences & Custom Notes</h2>
            <div 
              style={{ 
                backgroundColor: '#09090b', 
                padding: '1.25rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                lineHeight: '1.6',
                color: data.notes ? '#ffffff' : 'var(--text-muted)',
                fontStyle: data.notes ? 'normal' : 'italic',
                fontSize: '0.9rem'
              }}
            >
              {data.notes || 'No custom travel notes recorded on this profile.'}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="profile-section-title">CRM Operations Metadata</h2>
            <div className="profile-info-grid" style={{ fontSize: '0.8rem' }}>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Created Date</span>
                <span className="info-value" style={{ color: 'var(--text-secondary)' }}>{formatDateTime(data.created_at)}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Last Updated Date</span>
                <span className="info-value" style={{ color: 'var(--text-secondary)' }}>{formatDateTime(data.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel: Alert Logs feed */}
        <div className="alerts-panel" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, borderBottom: '1.5px solid var(--border)', paddingBottom: '0.5rem', color: '#ffffff', marginBottom: '1.25rem' }}>
            Triggered Alerts History
          </h2>
          
          {data.alerts && data.alerts.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No operational alerts triggered in the current cycle.
            </div>
          ) : (
            <div className="alerts-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {data.alerts.map((a) => (
                <div 
                  key={a.id} 
                  className={`alert-card-item alert-${a.urgency.toLowerCase()}`}
                  style={{ padding: '0.85rem', marginBottom: '0.5rem', boxShadow: 'none', border: '1px solid var(--border)', display: 'block' }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className={`badge badge-${a.urgency.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {a.urgency === 'Red' ? 'CRITICAL' : 'WARNING'}
                      </span>
                      <span className={`badge badge-${a.status === 'Active' ? 'red' : 'archived'}`} style={{ fontSize: '0.65rem' }}>
                        {a.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Fired: <strong>{formatDate(a.alert_date)}</strong>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Audit ID: #{a.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .hide-on-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .profile-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .profile-detail-panel {
            display: block !important;
          }
          .alerts-panel {
            margin-top: 2rem !important;
            border: 1px solid #ccc !important;
            background-color: white !important;
          }
          .badge {
            border: 1px solid #000 !important;
            background: none !important;
            color: #000 !important;
          }
          .info-value {
            color: #000000 !important;
          }
          .profile-section-title {
            color: #000000 !important;
            border-bottom: 1px solid #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
