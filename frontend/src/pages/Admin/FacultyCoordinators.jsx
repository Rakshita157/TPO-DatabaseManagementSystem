import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Home, LogOut, Settings, GraduationCap,
  Plus, Trash2, X, Loader2, CheckCircle, AlertCircle,
  PanelLeftClose, PanelLeftOpen, UserCircle
} from 'lucide-react';
import {
  getCollegeSettings, addFacultyCoordinator, deleteFacultyCoordinator
} from '../../services/admin.service';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FacultyCoordinators() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const isResizing = useRef(false);
  const settingsWrapRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

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

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const res = await getCollegeSettings();
      setCoordinators(res.data.facultyCoordinators || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load faculty coordinators', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoordinators(); }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('fullName', formData.fullName.trim());
      if (photoFile) fd.append('photo', photoFile);
      await addFacultyCoordinator(fd);
      setShowAddModal(false);
      setFormData({ fullName: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
      addToast('Faculty Coordinator added successfully');
      fetchCoordinators();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to add coordinator', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteFacultyCoordinator(confirmDelete.id);
      setConfirmDelete(null);
      addToast('Faculty Coordinator deleted successfully');
      fetchCoordinators();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to delete coordinator', 'error');
    } finally {
      setDeleting(false);
    }
  };

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
          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </nav>

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
              <div className="settings-popup-item" onClick={() => { navigate('/admin/faculty-coordinators'); setShowSettingsPopup(false); }}>
                <Users size={16} />
                <span>Faculty Coordinators</span>
              </div>
              <div className="settings-popup-item">
                <GraduationCap size={16} />
                <span>Student Coordinators</span>
              </div>
            </div>
          )}
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
            <div className="admin-avatar">
              {(storedUser.fullName || 'Admin').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="admin-info-text">
              <span className="admin-name">{storedUser.fullName || 'Admin'}</span>
              <span className="admin-role">Training & Placement Officer</span>
            </div>
          </div>
        </header>

        <div className="section-header">
          <div className="section-header-left">
            <h2>Faculty Coordinators</h2>
            <p>Manage and track faculty coordinator details</p>
          </div>
          <div className="section-header-right">
            <button className="export-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Faculty Coordinator
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spin" />
            <p>Loading faculty coordinators...</p>
          </div>
        ) : coordinators.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <UserCircle size={48} strokeWidth={1.5} />
            </div>
            <h3>No Faculty Coordinators</h3>
            <p>No faculty coordinators have been added yet. Click "Add Faculty Coordinator" to get started.</p>
          </div>
        ) : (
          <div className="faculty-table-wrap">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Full Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {coordinators.map((fc) => (
                  <tr key={fc.id}>
                    <td>
                      {fc.photo ? (
                        <img src={`${API_URL}/${fc.photo}`} alt={fc.fullName} className="faculty-photo" />
                      ) : (
                        <div className="faculty-photo-placeholder">
                          {fc.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="faculty-name">{fc.fullName}</td>
                    <td>
                      <button className="action-btn delete" onClick={() => setConfirmDelete(fc)}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Add Faculty Coordinator</h3>
              <button className="settings-popup-close" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Photo</label>
                <div className="photo-upload-area">
                  {photoPreview ? (
                    <div className="photo-preview-wrap">
                      <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                      <button type="button" className="photo-remove-btn" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="photo-file-input"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setPhotoFile(file);
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <Plus size={20} />
                      <span>Browse Photo</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="confirm-actions" style={{ marginTop: 20 }}>
                <button type="button" className="confirm-cancel" onClick={() => { setShowAddModal(false); setPhotoFile(null); setPhotoPreview(null); }}>Cancel</button>
                <button type="submit" className="confirm-delete" disabled={submitting || !formData.fullName.trim()}>
                  {submitting ? <><Loader2 size={14} className="spin" /> Adding...</> : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Faculty Coordinator</h3>
            <p>Are you sure you want to delete <strong>{confirmDelete.fullName}</strong>? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="confirm-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><Loader2 size={14} className="spin" /> Deleting...</> : 'Delete'}
              </button>
            </div>
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
