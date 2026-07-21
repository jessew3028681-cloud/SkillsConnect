'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Settings, 
  Save, 
  HelpCircle, 
  Sliders, 
  FileText, 
  ShieldAlert, 
  Server, 
  Cpu 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core settings form state
  const [platformName, setPlatformName] = useState('SkillsConnect Ghana');
  const [contactEmail, setContactEmail] = useState('support@skillsconnect.gov.gh');
  const [contactPhone, setContactPhone] = useState('+233 24 123 4567');
  const [aboutText, setAboutText] = useState('');

  // Extended simulation state variables (saved in local memory)
  const [escrowFee, setEscrowFee] = useState(5.0);
  const [autoVerify, setAutoVerify] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings', { credentials: 'include' });
        const data = await res.json();
        if (data.success && active) {
          setPlatformName(data.data.platform_name);
          setContactEmail(data.data.contact_email);
          setContactPhone(data.data.contact_phone);
          setAboutText(data.data.about_text);
        } else if (active) {
          toast.error(data.error || 'Failed to fetch platform configurations.');
        }
      } catch (err) {
        console.error(err);
        if (active) toast.error('Network error while fetching system parameters.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSettings();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platformName.trim()) {
      toast.error('Platform Brand Name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: platformName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          about_text: aboutText.trim()
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'System configurations updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update system variables.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during configurations update.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="System Variables">
        <LoadingSpinner message="Reading current variables configurations..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="System Configuration & variables">
      <div className="row g-4 text-dark" id="settings-workspace-row">
        {/* LEFT COLUMN: Main variables form */}
        <div className="col-lg-8">
          <div className="card shadow-sm border p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
              <Sliders size={20} />
              <span>Core Application Details</span>
            </h5>
            <p className="text-muted small mb-4">
              Update branding properties, formal support emails, contact phone lines, and legal texts across the application.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-semibold small text-dark">Platform Name</label>
                  <input 
                    type="text" 
                    className="form-control text-dark"
                    required
                    placeholder="SkillsConnect Ghana"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Contact Email</label>
                  <input 
                    type="email" 
                    className="form-control text-dark"
                    required
                    placeholder="support@skillsconnect.gov.gh"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-control text-dark"
                    required
                    placeholder="+233 24 123 4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-semibold small text-dark">Platform About Info Copy</label>
                  <textarea 
                    className="form-control text-dark"
                    rows="4"
                    placeholder="Connecting Ghanaian citizens with top-vetted professional and local trade services..."
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                  ></textarea>
                </div>

                <div className="col-md-12 text-end pt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Advanced Escrow Fees console */}
          <div className="card shadow-sm border p-4 bg-white">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Cpu size={20} className="text-secondary" />
              <span>Payments & Escrow Commission Fees</span>
            </h5>
            <div className="row g-3">
              <div className="col-md-8">
                <p className="text-muted small mb-0">
                  Configure the flat platform fee percentage calculated and deducted automatically during digital invoice escrow clearings.
                </p>
              </div>
              <div className="col-md-4">
                <div className="input-group">
                  <input 
                    type="number" 
                    className="form-control text-dark text-center fw-bold"
                    step="0.1"
                    min="0"
                    max="100"
                    value={escrowFee}
                    onChange={(e) => {
                      setEscrowFee(parseFloat(e.target.value) || 0);
                      toast.success('Escrow fee preference saved locally!');
                    }}
                  />
                  <span className="input-group-text bg-light fw-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Server and Status checks */}
        <div className="col-lg-4">
          <div className="card shadow-sm border p-4 bg-white mb-4" id="artisan-moderation-mode-card">
            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <Server size={18} className="text-primary" />
              <span>Listing Moderation Settings</span>
            </h6>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="fw-semibold d-block text-dark small">Automatic Verification</span>
                  <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Verify profiles instantly</span>
                </div>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch"
                    checked={autoVerify}
                    onChange={(e) => {
                      setAutoVerify(e.target.checked);
                      toast.success(`Instant verify turned ${e.target.checked ? 'ON' : 'OFF'}`);
                    }}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between border-top pt-3">
                <div>
                  <span className="fw-semibold d-block text-dark small">Maintenance Mode</span>
                  <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Show splash for upgrades</span>
                </div>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch"
                    checked={maintenanceMode}
                    onChange={(e) => {
                      setMaintenanceMode(e.target.checked);
                      toast.success(`Maintenance Mode turned ${e.target.checked ? 'ON' : 'OFF'}`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border p-4 bg-white" id="database-connectivity-card">
            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <ShieldAlert size={18} className="text-danger" />
              <span>Database Server Connectivity</span>
            </h6>
            <div className="d-flex flex-column gap-2 small text-muted">
              <div className="d-flex justify-content-between align-items-center">
                <span>Driver Class</span>
                <span className="fw-semibold text-dark">MariaDB / MySQL</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Status Code</span>
                <span className="badge bg-success text-white">ONLINE</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Max Pool Size</span>
                <span className="fw-semibold text-dark">15 Connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
