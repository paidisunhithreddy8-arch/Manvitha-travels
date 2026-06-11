import React, { useState, useEffect } from 'react';

export default function AlertsPanel({ onViewDetail }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/alerts/active`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Error fetching active alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${alertId}/dismiss`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const generateWhatsAppLink = (alert) => {
    const phoneClean = alert.phone.replace(/[^0-9+]/g, '');
    const occasionLabel = alert.occasion_type === 'birthday' ? 'Birthday' 
      : alert.occasion_type === 'anniversary' ? 'Wedding Anniversary' 
      : `${alert.festival_name || 'Festival'}`;

    // Load custom template from localStorage if exists, else use default (without emojis)
    const customTemplate = localStorage.getItem('manivtha_settings_wa_template');
    let text = `Hello ${alert.customer_name}, Greetings from Manivtha Tours & Travels.

We noticed your ${occasionLabel} is coming up on ${formatDate(alert.occasion_date)}.

We would love to help you plan your travel for this special occasion. Whether you need a premium sedan, a spacious SUV, or a tempo traveller for family trips, we have the perfect fleet and professional drivers ready for you.

Let us know if we can reserve a ride for you.
Best regards,
Manivtha Tours & Travels, Hyderabad`;

    if (customTemplate) {
      text = customTemplate
        .replace(/{customer_name}/g, alert.customer_name)
        .replace(/{occasion_label}/g, occasionLabel)
        .replace(/{occasion_date}/g, formatDate(alert.occasion_date));
    }

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  };

  const formatOccasionType = (type, festival) => {
    if (type === 'birthday') return 'Birthday';
    if (type === 'anniversary') return 'Wedding Anniversary';
    if (type === 'festival') return `${festival || 'Festival'}`;
    return type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Operational Booking Alerts</h1>
          <p className="page-subtitle">Milestones occurring in the next 7 days. Action these reminders to secure customer repeat bookings.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="spinner-wheel"></div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scanning operations calendar...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">[SECURE]</div>
          <h3 className="empty-state-title">No Pending Reminders Due</h3>
          <p className="empty-state-description">
            There are no customer occasions occurring in the 7-day window. All schedules are up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((a) => (
            <div 
              key={a.alert_id} 
              className={`alert-card-item alert-${a.urgency.toLowerCase()}`}
            >
              <div style={{ flex: '1 1 420px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className={`badge badge-${a.urgency.toLowerCase()}`}>
                    {a.urgency === 'Red' ? 'CRITICAL ACTION' : 'SCHEDULED WARNING'} ({a.days_until} days remaining)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Triggered: {formatDate(a.alert_date)}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  {a.customer_name}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <strong>Milestone:</strong> {formatOccasionType(a.occasion_type, a.festival_name)}
                  </div>
                  <div>
                    <strong>Occasion Date:</strong> {formatDate(a.occasion_date)}
                  </div>
                  <div>
                    <strong>Mobile:</strong> <a href={`tel:${a.phone}`} style={{ color: '#ffffff', fontWeight: 500, textDecoration: 'underline' }}>{a.phone}</a>
                  </div>
                  <div>
                    <strong>Email:</strong> <a href={`mailto:${a.email}`} style={{ color: '#ffffff', fontWeight: 500, textDecoration: 'underline' }}>{a.email}</a>
                  </div>
                </div>

                {a.notes && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: '#09090b', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)', color: '#cbd5e1' }}>
                    <strong>Travel Specifications:</strong> {a.notes}
                  </div>
                )}
              </div>

              {/* Action layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', minWidth: '160px' }}>
                <a 
                  href={generateWhatsAppLink(a)}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary" 
                  style={{ textDecoration: 'none', textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  OPEN WHATSAPP DRAFT
                </a>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, padding: '0.4rem' }} 
                    onClick={() => onViewDetail(a.reminder_id)}
                  >
                    Details
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, padding: '0.4rem', borderStyle: 'dashed' }} 
                    onClick={() => handleDismissAlert(a.alert_id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
