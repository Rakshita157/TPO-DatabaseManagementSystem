import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Home, LogOut, Settings, GraduationCap, UserCircle,
  X, Loader2, CheckCircle, AlertCircle, PanelLeftClose, PanelLeftOpen,
  Mail, Phone, MapPin, Clock, Edit, Save, Camera
} from 'lucide-react';
import { getCollegeSettings, updateCollegeSettings } from '../../services/admin.service';
import { getMe, updateUser } from '../../services/auth.service';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Dashboard.css';
import './AdminDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLE_LABELS = { ADMIN: 'Admin', CO_ADMIN: 'Co-Admin', STUDENT: 'Student' };

const EMPTY_COLLEGE_FORM = {
  tpoHeadName: '',
  tpoHeadEmail: '',
  tpoHeadPhone: '',
  officeAddress: '',
  officeHours: '',
};

export default function AdminDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [settings, setSettings] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const isResizing = useRef(false);
  const settingsWrapRef = useRef(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ fullName: '', collegeEmail: '' });
  const [savingAccount, setSavingAccount] = useState(false);

  const [collegeForm, setCollegeForm] = useState(EMPTY_COLLEGE_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const startResize = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMouseMove = (e) => {
      if (isResizing.current) {
        const newWidth = Math.min(Math.max(e.clientX, 180), 400);
        setSidebarWidth(newWidth);
      }
    };
    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    if (!showSettingsPopup) return;
    const handleClickOutside = (e) => {
      if (settingsWrapRef.current && !settingsWrapRef.current.contains(e.target)) {
        setShowSettingsPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsPopup]);

  const applySettings = (data) => {
    setSettings(data);
    setCollegeForm({
      tpoHeadName: data?.tpoHeadName || '',
      tpoHeadEmail: data?.tpoHeadEmail || '',
      tpoHeadPhone: data?.tpoHeadPhone || '',
      officeAddress: data?.officeAddress || '',
      officeHours: data?.officeHours || '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, settingsRes] = await Promise.all([
        getMe(),
        getCollegeSettings(),
      ]);
      if (meRes.data?.user) {
        setUser(meRes.data.user);
        localStorage.setItem('user', JSON.stringify(meRes.data.user));
      }
      applySettings(settingsRes.data?.collegeSettings || null);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const openAccountModal = () => {
    setAccountForm({
      fullName: user.fullName || '',
      collegeEmail: user.collegeEmail || '',
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const fullName = accountForm.fullName.trim();
    const collegeEmail = accountForm.collegeEmail.trim();

    if (!fullName) {
      addToast('Full name is required', 'error');
      return;
    }

    try {
      setSavingAccount(true);
      const res = await updateUser(user.id, { fullName, collegeEmail });
      const updated = res.data?.user;
      if (updated) {
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setShowAccountModal(false);
      addToast('Admin details updated successfully');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update admin details', 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be 2 MB or smaller', 'error');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();

    if (!collegeForm.tpoHeadName.trim() || !collegeForm.tpoHeadEmail.trim() || !collegeForm.tpoHeadPhone.trim()) {
      addToast('Name, email and phone are required', 'error');
      return;
    }

    try {
      setSavingCollege(true);
      const fd = new FormData();
      fd.append('tpoHeadName', collegeForm.tpoHeadName.trim());
      fd.append('tpoHeadEmail', collegeForm.tpoHeadEmail.trim());
      fd.append('tpoHeadPhone', collegeForm.tpoHeadPhone.trim());
      fd.append('officeAddress', collegeForm.officeAddress.trim());
      fd.append('officeHours', collegeForm.officeHours.trim());

      if (photoFile) {
        fd.append('photo', photoFile);
      } else if (removePhoto && settings?.tpoHeadPhoto) {
        fd.append('tpoHeadPhoto', '');
      }

      const res = await updateCollegeSettings(fd);
      applySettings(res.data?.collegeSettings || null);
      addToast('College information updated successfully');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update college information', 'error');
    } finally {
      setSavingCollege(false);
    }
  };

  const currentPhoto = removePhoto
    ? null
    : photoPreview || (settings?.tpoHeadPhoto ? `${API_URL}/${settings.tpoHeadPhoto}` : null);

  const initials = (user.fullName || 'Admin')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-dashboard">
      {sidebarCollapsed && (
        <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)} title="Expand sidebar">
          <PanelLeftOpen size={18} />
        </button>
      )}

      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={!sidebarCollapsed ? { width: sidebarWidth } : undefined}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <img src={tpoLogo} alt="T&P Cell Logo" className="admin-sidebar-logo-img" />
            {!sidebarCollapsed && (
              <div className="admin-sidebar-logo-text">
                <div className="admin-sidebar-title">Training and<br />Placement Cell</div>
                <div className="admin-sidebar-subtitle">GWEC, Ajmer</div>
              </div>
            )}
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item" onClick={() => navigate('/admin/dashboard')} title="Students">
            <Users size={18} />
            {!sidebarCollapsed && 'Students'}
          </button>
          <button className="admin-nav-item" onClick={() => navigate('/')} title="Landing Page">
            <Home size={18} />
            {!sidebarCollapsed && 'Landing Page'}
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-settings-wrap" ref={settingsWrapRef}>
            <button
              className={`admin-nav-item admin-nav-settings ${showSettingsPopup ? 'active' : ''}`}
              onClick={() => setShowSettingsPopup(prev => !prev)}
              title="Settings"
            >
              <Settings size={18} />
              {!sidebarCollapsed && 'Settings'}
            </button>
            {showSettingsPopup && !sidebarCollapsed && (
              <div className="settings-popup">
                <div className="settings-popup-header">
                  <button className="settings-popup-close" onClick={() => setShowSettingsPopup(false)}>
                    <X size={14} />
                  </button>
                </div>
                <div className="settings-popup-item" onClick={() => { navigate('/admin/faculty-coordinators', { state: { from: location.pathname } }); setShowSettingsPopup(false); }}>
                  <Users size={16} />
                  <span>Faculty Coordinators</span>
                </div>
                <div className="settings-popup-item" onClick={() => { navigate('/admin/student-coordinators', { state: { from: location.pathname } }); setShowSettingsPopup(false); }}>
                  <GraduationCap size={16} />
                  <span>Student Coordinators</span>
                </div>
                <div className={`settings-popup-item ${location.pathname === '/admin/admin-details' ? 'active' : ''}`} onClick={() => { navigate('/admin/admin-details', { state: { from: location.pathname } }); setShowSettingsPopup(false); }}>
                  <UserCircle size={16} />
                  <span>Admin Details</span>
                </div>
              </div>
            )}
          </div>

          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="admin-sidebar-footer">
            <img src={tpoLogo} alt="T&P Cell Logo" className="admin-sidebar-footer-logo" />
            <div className="admin-sidebar-footer-text">
              <div className="admin-sidebar-title">Training and<br />Placement Cell</div>
              <div className="admin-sidebar-subtitle">GWEC, Ajmer</div>
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="sidebar-resize-handle" onMouseDown={startResize} />
        )}
      </aside>

      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <header className="admin-topbar">
          <div className="admin-admin-info">
            <div className="admin-avatar">{initials}</div>
            <div className="admin-info-text">
              <span className="admin-name">{user.fullName || 'Admin'}</span>
              <span className="admin-role">Training & Placement Officer</span>
            </div>
          </div>
        </header>

        <div className="section-header">
          <div className="section-header-left">
            <h2>Admin Details</h2>
            <p>View and update your account and college information</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spin" />
            <p>Loading admin details...</p>
          </div>
        ) : (
          <div className="admin-details-grid">
            <section className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-heading">
                  <div className="detail-card-icon"><UserCircle size={20} /></div>
                  <div>
                    <h3>Admin Account</h3>
                    <p>Your personal account information</p>
                  </div>
                </div>
                <button className="detail-edit-btn" onClick={openAccountModal}>
                  <Edit size={15} />
                  Edit
                </button>
              </div>

              <div className="detail-field-list">
                <div className="detail-field">
                  <span className="detail-field-label">Full Name</span>
                  <span className="detail-field-value">{user.fullName || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">College Email</span>
                  <span className="detail-field-value">{user.collegeEmail || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Role</span>
                  <span className="detail-field-value">{ROLE_LABELS[user.role] || user.role || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Joined On</span>
                  <span className="detail-field-value">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            </section>

            <section className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-heading">
                  <div className="detail-card-icon"><Settings size={20} /></div>
                  <div>
                    <h3>College Information</h3>
                    <p>Training &amp; Placement Cell details</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveCollege} className="detail-form">
                <div className="college-photo-row">
                  <div className="college-photo-preview">
                    {currentPhoto ? (
                      <img src={currentPhoto} alt="TPO Head" />
                    ) : (
                      <UserCircle size={40} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="college-photo-actions">
                    <label className="detail-edit-btn">
                      <Camera size={15} />
                      Change Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="photo-file-input"
                        onChange={handlePhotoChange}
                      />
                    </label>
                    {currentPhoto && (
                      <button type="button" className="detail-remove-btn" onClick={handleClearPhoto}>
                        Remove
                      </button>
                    )}
                    <span className="college-photo-hint">JPEG, PNG or WebP · Max 2 MB</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>TPO Head Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter name"
                    value={collegeForm.tpoHeadName}
                    onChange={(e) => setCollegeForm(prev => ({ ...prev, tpoHeadName: e.target.value }))}
                    required
                  />
                </div>

                <div className="detail-form-row">
                  <div className="form-group">
                    <label><Mail size={13} /> Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter email"
                      value={collegeForm.tpoHeadEmail}
                      onChange={(e) => setCollegeForm(prev => ({ ...prev, tpoHeadEmail: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><Phone size={13} /> Phone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={collegeForm.tpoHeadPhone}
                      onChange={(e) => setCollegeForm(prev => ({ ...prev, tpoHeadPhone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><MapPin size={13} /> Office Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter office address"
                    value={collegeForm.officeAddress}
                    onChange={(e) => setCollegeForm(prev => ({ ...prev, officeAddress: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label><Clock size={13} /> Office Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mon - Fri, 9:00 AM - 5:00 PM"
                    value={collegeForm.officeHours}
                    onChange={(e) => setCollegeForm(prev => ({ ...prev, officeHours: e.target.value }))}
                  />
                </div>

                <div className="detail-form-actions">
                  <button type="submit" className="confirm-delete" disabled={savingCollege}>
                    {savingCollege ? <><Loader2 size={14} className="spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>

      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Edit Admin Details</h3>
              <button className="settings-popup-close" onClick={() => setShowAccountModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveAccount}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>College Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter college email"
                  value={accountForm.collegeEmail}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, collegeEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="confirm-actions" style={{ marginTop: 20 }}>
                <button type="button" className="confirm-cancel" onClick={() => setShowAccountModal(false)}>Cancel</button>
                <button type="submit" className="confirm-delete" disabled={savingAccount || !accountForm.fullName.trim()}>
                  {savingAccount ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
