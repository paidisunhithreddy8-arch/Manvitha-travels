import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [reminderDays, setReminderDays] = useState(7);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableWhatsAppAutoDraft, setEnableWhatsAppAutoDraft] = useState(true);
  
  // WhatsApp message template
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    `Hello {customer_name}, Greetings from Manivtha Tours & Travels!

We noticed your {occasion_label} is coming up on {occasion_date}.

We would love to help you plan your travel for this special occasion! Whether you need a premium sedan, a spacious SUV, or a tempo traveller for family trips, we have the perfect fleet and professional drivers ready for you.

Let us know if we can reserve a ride for you!
Best regards,
Manivtha Tours & Travels, Hyderabad`
  );

  // SMTP Email Configuration Settings
  const [smtpServer, setSmtpServer] = useState('mail.manvithatravels.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('alerts@manvithatravels.com');
  const [smtpSecure, setSmtpSecure] = useState(false);

  // User Management
  const [users, setUsers] = useState([
    { id: 1, name: 'Srinivasa Rao', role: 'Hyderabad Office Admin', email: 'srinivas.rao@manvitha.com', active: true },
    { id: 2, name: 'Anil Kumar', role: 'Customer Success Executive', email: 'anil.k@manvitha.com', active: true },
    { id: 3, name: 'Lakshmi Prasad', role: 'Fleet Dispatch Planner', email: 'lakshmi.p@manvitha.com', active: true }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Hyderabad Office Admin');
  const [newUserEmail, setNewUserEmail] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedDays = localStorage.getItem('manivtha_settings_reminder_days');
    if (savedDays) setReminderDays(parseInt(savedDays, 10));

    const savedEmail = localStorage.getItem('manivtha_settings_enable_email');
    if (savedEmail) setEnableEmail(savedEmail === 'true');

    const savedWaDraft = localStorage.getItem('manivtha_settings_wa_draft');
    if (savedWaDraft) setEnableWhatsAppAutoDraft(savedWaDraft === 'true');

    const savedWaTemplate = localStorage.getItem('manivtha_settings_wa_template');
    if (savedWaTemplate) setWhatsappTemplate(savedWaTemplate);

    const savedSmtpServer = localStorage.getItem('manivtha_settings_smtp_server');
    if (savedSmtpServer) setSmtpServer(savedSmtpServer);

    const savedSmtpPort = localStorage.getItem('manivtha_settings_smtp_port');
    if (savedSmtpPort) setSmtpPort(savedSmtpPort);

    const savedSmtpUser = localStorage.getItem('manivtha_settings_smtp_user');
    if (savedSmtpUser) setSmtpUser(savedSmtpUser);

    const savedSmtpSecure = localStorage.getItem('manivtha_settings_smtp_secure');
    if (savedSmtpSecure) setSmtpSecure(savedSmtpSecure === 'true');

    const savedUsers = localStorage.getItem('manivtha_settings_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('manivtha_settings_reminder_days', reminderDays.toString());
    localStorage.setItem('manivtha_settings_enable_email', enableEmail.toString());
    localStorage.setItem('manivtha_settings_wa_draft', enableWhatsAppAutoDraft.toString());
    localStorage.setItem('manivtha_settings_wa_template', whatsappTemplate);
    localStorage.setItem('manivtha_settings_smtp_server', smtpServer);
    localStorage.setItem('manivtha_settings_smtp_port', smtpPort);
    localStorage.setItem('manivtha_settings_smtp_user', smtpUser);
    localStorage.setItem('manivtha_settings_smtp_secure', smtpSecure.toString());
    localStorage.setItem('manivtha_settings_users', JSON.stringify(users));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUserObj = {
      id: Date.now(),
      name: newUserName,
      role: newUserRole,
      email: newUserEmail,
      active: true
    };

    const updatedUsers = [...users, newUserObj];
    setUsers(updatedUsers);
    localStorage.setItem('manivtha_settings_users', JSON.stringify(updatedUsers));
    
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const toggleUserStatus = (id) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, active: !user.active };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('manivtha_settings_users', JSON.stringify(updatedUsers));
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Administrative Configurations</h1>
          <p className="page-subtitle">Configure thresholds, WhatsApp templates, notification channels, user authorization and preferences.</p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '0.85rem 1rem', 
          backgroundColor: '#1c1c1e', 
          border: '1px solid #ffffff', 
          borderRadius: 'var(--radius-md)', 
          fontSize: '0.85rem',
          color: '#ffffff',
          fontWeight: 600
        }}>
          SETTINGS SAVED SUCCESSFULLY - SYSTEM PREFERENCES UPDATED
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 1: Reminder Threshold */}
          <div className="form-panel" style={{ maxWidth: '100%', margin: '0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              Reminder Threshold Configuration
            </h3>
            
            <div className="form-group-item">
              <label className="form-group-label">Upcoming Occasion Alert Trigger (Days Prior)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  className="form-input-field" 
                  style={{ maxWidth: '120px' }}
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Math.max(1, parseInt(e.target.value, 10) || 7))}
                  min="1"
                  max="30"
                  required
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  System scans occasion schedules and triggers warnings exactly {reminderDays} days in advance of milestone occurrence.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Notification & WhatsApp settings */}
          <div className="form-panel" style={{ maxWidth: '100%', margin: '0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              Communication Channels & Integrations
            </h3>

            <div className="form-group-item">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input 
                    type="checkbox" 
                    checked={enableEmail} 
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    style={{ accentColor: '#ffffff', width: '16px', height: '16px' }}
                  />
                  <span>Enable SMTP email logging notification prompts</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input 
                    type="checkbox" 
                    checked={enableWhatsAppAutoDraft} 
                    onChange={(e) => setEnableWhatsAppAutoDraft(e.target.checked)}
                    style={{ accentColor: '#ffffff', width: '16px', height: '16px' }}
                  />
                  <span>Enable dynamic WhatsApp redirect draft templates</span>
                </label>
              </div>
            </div>

            <div className="form-group-item" style={{ marginTop: '1.25rem' }}>
              <label className="form-group-label">WhatsApp Greeting Draft Message Template</label>
              <textarea 
                className="form-input-field"
                rows="8"
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                placeholder="Compose template..."
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                Supported replacement tokens: <code>{`{customer_name}`}</code>, <code>{`{occasion_label}`}</code>, <code>{`{occasion_date}`}</code>.
              </span>
            </div>
          </div>

          {/* Section 3: SMTP Mail Server Credentials */}
          <div className="form-panel" style={{ maxWidth: '100%', margin: '0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              Email Server Setup (SMTP Host Settings)
            </h3>

            <div className="form-grid-2col">
              <div className="form-group-item">
                <label className="form-group-label">SMTP Server Address</label>
                <input 
                  type="text"
                  className="form-input-field"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                />
              </div>

              <div className="form-group-item">
                <label className="form-group-label">Port</label>
                <input 
                  type="text"
                  className="form-input-field"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group-item">
                <label className="form-group-label">Alert Sender Username</label>
                <input 
                  type="email"
                  className="form-input-field"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>

              <div className="form-group-item" style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', marginTop: '1rem' }}>
                  <input 
                    type="checkbox" 
                    checked={smtpSecure} 
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    style={{ accentColor: '#ffffff', width: '16px', height: '16px' }}
                  />
                  <span>Use SSL / TLS connection protocol</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: User Profile Management */}
          <div className="form-panel" style={{ maxWidth: '100%', margin: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                User Management & Permissions
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setShowAddUserModal(true)}
              >
                + Register Staff
              </button>
            </div>

            <div className="data-table-container" style={{ borderTop: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Authorized Staff User</th>
                    <th>Staff Title / Department</th>
                    <th>Permissions Class</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ opacity: user.active ? 1 : 0.5 }}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                      </td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`badge ${user.active ? 'badge-active' : 'badge-archived'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          {user.active ? 'Active CRM User' : 'Revoked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.active ? 'Revoke Access' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: System Preferences */}
          <div className="form-panel" style={{ maxWidth: '100%', margin: '0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              Corporate System Preferences
            </h3>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Default Theme:</strong> Strict Monochrome Dark (Matte Black / Zinc Outline) - Locked</div>
              <div><strong>System Reference Execution Calendar Date:</strong> June 11, 2026 - Configured</div>
              <div><strong>Enterprise Scope:</strong> Chauffeur, Outstation, and Airport Logistics Operations</div>
            </div>
          </div>

          {/* Submit card buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '3rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Save Configurations
            </button>
          </div>

        </div>
      </form>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="overlay-modal">
          <div className="modal-content-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ffffff' }}>Register Staff User</h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                style={{ border: 'none', padding: '0.2rem 0.4rem', fontSize: '1.1rem' }} 
                onClick={() => setShowAddUserModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="form-group-item">
                <label className="form-group-label">User Full Name</label>
                <input 
                  type="text" 
                  className="form-input-field" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                  required
                />
              </div>

              <div className="form-group-item">
                <label className="form-group-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input-field" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. anil.k@manvitha.com"
                  required
                />
              </div>

              <div className="form-group-item">
                <label className="form-group-label">Staff Role / Permission Group</label>
                <select 
                  className="form-input-field"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="Hyderabad Office Admin">Hyderabad Office Admin</option>
                  <option value="Customer Success Executive">Customer Success Executive</option>
                  <option value="Fleet Dispatch Planner">Fleet Dispatch Planner</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
