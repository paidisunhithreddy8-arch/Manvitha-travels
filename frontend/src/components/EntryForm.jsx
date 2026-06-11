import React, { useState, useEffect } from 'react';

export default function EntryForm({ reminderId, onSave, onCancel }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Form Fields
  const [customerId, setCustomerId] = useState('');
  const [occasionType, setOccasionType] = useState('birthday');
  const [occasionDate, setOccasionDate] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');

  // Add Customer Modal States
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custError, setCustError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCustomers();
    if (reminderId) {
      fetchReminderDetails();
    }
  }, [reminderId]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchReminderDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/customer_occasionbased_booking_remi/${reminderId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerId(data.customer_id);
        setOccasionType(data.occasion_type);
        setOccasionDate(data.occasion_date);
        setFestivalName(data.festival_name || '');
        setStatus(data.status);
        setNotes(data.notes || '');
      }
    } catch (err) {
      console.error('Error fetching reminder detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerId) newErrors.customerId = 'Please select a customer profile';
    if (!occasionDate) {
      newErrors.occasionDate = 'Date selection is required';
    } else {
      const year = parseInt(occasionDate.split('-')[0], 10);
      if (isNaN(year) || year < 1900 || year > 2100) {
        newErrors.occasionDate = 'Please select a valid date calendar entry';
      }
    }
    if (occasionType === 'festival' && !festivalName.trim()) {
      newErrors.festivalName = 'Festival name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    const payload = {
      customer_id: parseInt(customerId, 10),
      occasion_type: occasionType,
      occasion_date: occasionDate,
      festival_name: occasionType === 'festival' ? festivalName : '',
      status,
      notes
    };

    try {
      setLoading(true);
      const url = reminderId 
        ? `${API_URL}/customer_occasionbased_booking_remi/${reminderId}`
        : `${API_URL}/customer_occasionbased_booking_remi`;
      
      const method = reminderId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        onSave();
      } else {
        setSubmitError(result.message || 'An error occurred while saving.');
      }
    } catch (err) {
      setSubmitError('Failed to establish contact with backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setCustError('');

    if (!custName.trim() || !custEmail.trim() || !custPhone.trim()) {
      setCustError('Please enter all customer contact details.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(custEmail)) {
      setCustError('Please enter a valid email format.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: custName, email: custEmail, phone: custPhone })
      });

      const newCust = await res.json();

      if (res.ok) {
        setCustomers(prev => [...prev, newCust].sort((a, b) => a.name.localeCompare(b.name)));
        setCustomerId(newCust.id);
        setShowAddCustomer(false);
        setCustName('');
        setCustEmail('');
        setCustPhone('');
      } else {
        setCustError(newCust.message || 'Failed to save customer.');
      }
    } catch (err) {
      setCustError('Network communication error registering customer.');
    }
  };

  if (loading && reminderId && !customerId) {
    return (
      <div className="loading-spinner-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="spinner-wheel"></div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading preferences form...</p>
      </div>
    );
  }

  return (
    <div className="form-panel">
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
        {reminderId ? 'Update Reminder Settings' : 'New Reminder Rule Setting'}
      </h2>

      {submitError && (
        <div style={{ marginBottom: '1.25rem', padding: '0.65rem 0.85rem', backgroundColor: '#18181b', border: '1px solid #71717a', borderRadius: '6px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
          [WARNING] {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Selection Profile */}
        <div className="form-group-item">
          <label className="form-group-label">Customer Profile</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              className="form-input-field"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={!!reminderId}
            >
              <option value="">-- Select Registered Profile --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
            {!reminderId && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flexShrink: 0, padding: '0.55rem 1rem' }}
                onClick={() => setShowAddCustomer(true)}
              >
                + Register New
              </button>
            )}
          </div>
          {errors.customerId && (
            <span style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600' }}>
              [ERROR] {errors.customerId}
            </span>
          )}
        </div>

        {/* Occasion Type */}
        <div className="form-group-item">
          <label className="form-group-label">Occasion Type</label>
          <select
            className="form-input-field"
            value={occasionType}
            onChange={(e) => setOccasionType(e.target.value)}
          >
            <option value="birthday">Birthday</option>
            <option value="anniversary">Wedding Anniversary</option>
            <option value="festival">Festival Preference</option>
          </select>
        </div>

        {/* Festival Name (Conditional) */}
        {occasionType === 'festival' && (
          <div className="form-group-item">
            <label className="form-group-label">Festival Name</label>
            <input
              type="text"
              className="form-input-field"
              placeholder="e.g. Diwali, Eid, Christmas"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
            />
            {errors.festivalName && (
              <span style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600' }}>
                [ERROR] {errors.festivalName}
              </span>
            )}
          </div>
        )}

        {/* Occasion Date & Status */}
        <div className="form-grid-2col">
          <div className="form-group-item">
            <label className="form-group-label">Occasion Date</label>
            <input
              type="date"
              className="form-input-field"
              value={occasionDate}
              onChange={(e) => setOccasionDate(e.target.value)}
            />
            {errors.occasionDate && (
              <span style={{ display: 'block', color: '#ffffff', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600' }}>
                [ERROR] {errors.occasionDate}
              </span>
            )}
          </div>

          <div className="form-group-item">
            <label className="form-group-label">Monitoring Status</label>
            <select
              className="form-input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active Tracking</option>
              <option value="Completed">Completed / Booked</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Notes / Travel Preferences */}
        <div className="form-group-item">
          <label className="form-group-label">Travel Specifications & Preferences</label>
          <textarea
            className="form-input-field"
            rows="4"
            placeholder="Type vehicle preference (SUV, Innova, Sedan), destination history, driver preferences..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Form Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Settings...' : reminderId ? 'Update Settings' : 'Save Rule Preference'}
          </button>
        </div>
      </form>

      {/* Add Customer Inline Modal */}
      {showAddCustomer && (
        <div className="overlay-modal">
          <div className="modal-content-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ffffff' }}>Register New Customer</h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                style={{ border: 'none', padding: '0.2rem 0.4rem', fontSize: '1.1rem' }} 
                onClick={() => setShowAddCustomer(false)}
              >
                &times;
              </button>
            </div>
            {custError && (
              <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#18181b', border: '1px solid #71717a', color: '#ffffff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                [ERROR] {custError}
              </div>
            )}
            <form onSubmit={handleAddCustomer}>
              <div className="form-group-item">
                <label className="form-group-label">Customer Name</label>
                <input
                  type="text"
                  className="form-input-field"
                  placeholder="e.g. Anand Sharma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-item">
                <label className="form-group-label">Email Address</label>
                <input
                  type="email"
                  className="form-input-field"
                  placeholder="e.g. anand@gmail.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-item">
                <label className="form-group-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input-field"
                  placeholder="e.g. +91 9988776655"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddCustomer(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
