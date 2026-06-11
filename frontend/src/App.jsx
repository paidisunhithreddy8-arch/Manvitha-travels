import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import DetailView from './components/DetailView';
import AlertsPanel from './components/AlertsPanel';
import ReportsDashboard from './components/ReportsDashboard';
import Settings from './components/Settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('manivtha_authenticated') === 'true';
  });
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'dashboard' | 'new-reminder' | 'edit-reminder' | 'detail-reminder' | 'alerts' | 'reports' | 'settings'
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem('manivtha_scratchpad') || 'E.g. Check driver status for Innova outstation trip.';
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlertCount();
    }
  }, [currentScreen, isAuthenticated]);

  const fetchAlertCount = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts/active`);
      if (res.ok) {
        const data = await res.json();
        setActiveAlertsCount(data.length);
      }
    } catch (err) {
      console.error('Failed to load alert count:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'manivtha2026') {
      setIsAuthenticated(true);
      localStorage.setItem('manivtha_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Check Username and Password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('manivtha_authenticated');
  };

  const handleScratchpadChange = (e) => {
    setScratchpadText(e.target.value);
    localStorage.setItem('manivtha_scratchpad', e.target.value);
  };

  const handleSaveReminder = () => {
    setCurrentScreen('dashboard');
  };

  const handleCancelForm = () => {
    setCurrentScreen('dashboard');
  };

  const navigateToEdit = (id) => {
    setSelectedReminderId(id);
    setCurrentScreen('edit-reminder');
  };

  const navigateToDetail = (id) => {
    setSelectedReminderId(id);
    setCurrentScreen('detail-reminder');
  };

  const renderBreadcrumbs = () => {
    const crumbs = [{ label: 'CRM DASHBOARD', screen: 'dashboard' }];
    
    if (currentScreen === 'new-reminder') {
      crumbs.push({ label: 'REGISTER MILESTONE REMINDER', screen: 'new-reminder' });
    } else if (currentScreen === 'edit-reminder') {
      crumbs.push({ label: 'MODIFY REMINDER PREFERENCE', screen: 'edit-reminder' });
    } else if (currentScreen === 'detail-reminder') {
      crumbs.push({ label: 'BOOKING PROFILE & LOGS', screen: 'detail-reminder' });
    } else if (currentScreen === 'alerts') {
      crumbs.push({ label: 'PENDING NOTIFICATIONS', screen: 'alerts' });
    } else if (currentScreen === 'reports') {
      crumbs.push({ label: 'REPORTS & FREQUENCY TRENDS', screen: 'reports' });
    } else if (currentScreen === 'settings') {
      crumbs.push({ label: 'ADMINISTRATIVE CONFIGURATIONS', screen: 'settings' });
    }

    return (
      <div className="breadcrumbs hide-on-print">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin: '0 0.4rem', color: 'var(--text-muted)' }}>/</span>}
            <span 
              style={{ 
                cursor: i < crumbs.length - 1 ? 'pointer' : 'default', 
                color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: i === crumbs.length - 1 ? '600' : 'normal'
              }}
              onClick={() => i < crumbs.length - 1 && setCurrentScreen(c.screen)}
            >
              {c.label}
            </span>
          </span>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen-wrapper">
        {/* Left pane: corporate welcome */}
        <div className="login-left-pane">
          <div className="login-left-branding">
            <span style={{ 
              display: 'inline-block',
              width: '32px',
              height: '32px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontWeight: 800,
              borderRadius: '4px',
              textAlign: 'center',
              lineHeight: '32px'
            }}>M</span>
            <span>MANIVTHA TOURS & TRAVELS</span>
          </div>

          <div className="login-left-content">
            <h2 className="login-left-tagline">
              Customer Occasion-Based Booking Reminder System
            </h2>
            <p className="login-left-desc">
              A premium, enterprise-grade CRM console engineered for corporate travel operations. Automatically trigger client alerts and preferences logs 7 days prior to milestones, securing repeat customer reservations.
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            &copy; 2026 Manivtha Tours & Travels. Madhapur, Hyderabad Office.
          </div>
        </div>

        {/* Right pane: login credentials input */}
        <div className="login-right-pane">
          <div className="login-form-card">
            <div className="login-form-header">
              <h1 className="login-form-title">Staff Sign In</h1>
              <p className="login-form-subtitle">Enter your administrative credentials to log in.</p>
            </div>

            {loginError && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#18181b', 
                border: '1px solid #71717a', 
                color: '#ffffff', 
                borderRadius: '6px', 
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                [ERROR] {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group-item" style={{ margin: 0 }}>
                <label className="form-group-label" style={{ color: '#ffffff' }}>Username</label>
                <input 
                  type="text" 
                  className="form-input-field" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  required
                />
              </div>

              <div className="form-group-item" style={{ margin: 0 }}>
                <label className="form-group-label" style={{ color: '#ffffff' }}>Password</label>
                <input 
                  type="password" 
                  className="form-input-field" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                Sign In
              </button>
            </form>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              Demo access credentials: <code>admin</code> / <code>manivtha2026</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className={`sidebar hide-on-print ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">M</div>
          <div className="sidebar-title">Manivtha CRM</div>
        </div>

        {/* Office Staff Avatar widget */}
        <div className="sidebar-user">
          <div style={{ fontWeight: 600, color: 'white' }}>Srinivasa Rao</div>
          <div className="sidebar-user-role">
            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%' }}></span>
            Hyderabad Admin Office
          </div>
        </div>

        {/* Active Date Calendar widget */}
        <div className="date-calendar-widget">
          <div className="date-calendar-header">System Operations Date</div>
          <div className="date-calendar-value">11 Jun 2026</div>
        </div>

        {/* Nav list */}
        <ul className="sidebar-menu">
          <li>
            <button 
              className={`sidebar-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('dashboard')}
            >
              <span>REMINDER LIST</span>
            </button>
          </li>
          
          <li>
            <button 
              className={`sidebar-item ${currentScreen === 'new-reminder' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('new-reminder')}
            >
              <span>ADD PREFERENCE</span>
            </button>
          </li>

          <li>
            <button 
              className={`sidebar-item ${currentScreen === 'alerts' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('alerts')}
            >
              <span>ACTIVE ALERTS</span>
              {activeAlertsCount > 0 && (
                <span className="sidebar-badge">{activeAlertsCount}</span>
              )}
            </button>
          </li>

          <li>
            <button 
              className={`sidebar-item ${currentScreen === 'reports' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('reports')}
            >
              <span>REPORTS & TRENDS</span>
            </button>
          </li>

          <li>
            <button 
              className={`sidebar-item ${currentScreen === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('settings')}
            >
              <span>SETTINGS</span>
            </button>
          </li>
          
          <li style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
            <button 
              className="sidebar-item" 
              onClick={handleLogout}
              style={{ color: 'var(--text-muted)' }}
            >
              <span>SIGN OUT</span>
            </button>
          </li>
        </ul>

        {/* Quick Notepad scratchpad */}
        <div className="sidebar-notepad">
          <div className="sidebar-notepad-title">QUICK STAFF NOTES</div>
          <textarea 
            className="sidebar-notepad-area" 
            placeholder="Jot down temporary notes..."
            value={scratchpadText}
            onChange={handleScratchpadChange}
          />
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="workspace">
        <header className="workspace-header hide-on-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Sidebar toggle button */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border)' }}
            >
              {sidebarCollapsed ? '>>' : '<<'}
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Manivtha Tours & Travels</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Car Rentals & Outstation Services</span>
            </div>
          </div>
          <div className="workspace-date">
            Hyderabad Office | 11 June 2026
          </div>
        </header>

        {/* Page Content viewport */}
        <div className="workspace-container">
          {renderBreadcrumbs()}

          {currentScreen === 'dashboard' && (
            <Dashboard 
              onAddClick={() => setCurrentScreen('new-reminder')}
              onEditClick={navigateToEdit}
              onViewClick={navigateToDetail}
            />
          )}

          {currentScreen === 'new-reminder' && (
            <EntryForm 
              onSave={handleSaveReminder}
              onCancel={handleCancelForm}
            />
          )}

          {currentScreen === 'edit-reminder' && (
            <EntryForm 
              reminderId={selectedReminderId}
              onSave={handleSaveReminder}
              onCancel={handleCancelForm}
            />
          )}

          {currentScreen === 'detail-reminder' && (
            <DetailView 
              reminderId={selectedReminderId}
              onBackClick={() => setCurrentScreen('dashboard')}
              onEditClick={navigateToEdit}
            />
          )}

          {currentScreen === 'alerts' && (
            <AlertsPanel 
              onViewDetail={navigateToDetail}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsDashboard />
          )}

          {currentScreen === 'settings' && (
            <Settings />
          )}
        </div>

        <footer className="app-footer hide-on-print">
          <div>&copy; 2026 Manivtha Tours & Travels. Madhapur, Hyderabad Office. Support Desk: +91 40 2345 6789</div>
        </footer>
      </div>
    </div>
  );
}
