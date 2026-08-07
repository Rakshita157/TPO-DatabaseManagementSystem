import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ChevronUp, Calendar, FileText,
  User, GraduationCap, Phone, Mail, MapPin,
  Edit, X, Save, ExternalLink, CheckCircle, Trash2,
  PanelLeftClose, PanelLeftOpen, Home, LogOut, Users
} from 'lucide-react';
import { getStudentById, updateStudentProfile, updateUser, deleteStudent } from '../../services/admin.service';
import {
  FIELD_SECTIONS, COURSE_LABELS,
  formatFieldValue, getVisibleFields, getExtraFields
} from '../../config/studentFields';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Dashboard.css';
import '../Student/Profile.css';

const ICON_MAP = { User, GraduationCap, Phone, MapPin, FileText };

function renderFieldValue(fieldDef, value) {
  if (fieldDef.renderer === 'resumeLink') {
    return value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="resume-link-btn">
        <ExternalLink size={14} />
        View Resume
      </a>
    ) : '\u2014';
  }
  if (fieldDef.renderer === 'link') {
    return value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="linkedin-link-btn">
        <ExternalLink size={14} />
        {fieldDef.linkLabel || 'Link'}
      </a>
    ) : '\u2014';
  }
  const formatted = formatFieldValue(value, fieldDef.formatter);
  return formatted || fieldDef.fallback || '\u2014';
}

export default function StudentDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const startResize = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMouseMove = (e) => {
      if (isResizing.current) {
        setSidebarWidth(Math.min(Math.max(e.clientX, 180), 400));
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudentById(userId);
        setStudent(res.data);
      } catch {
        setError('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [userId]);

  const handleDelete = async () => {
    try {
      await deleteStudent(userId);
      navigate(from || '/admin/dashboard');
    } catch {
    }
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSidebar = () => (
    <>
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
          <button className="admin-nav-item" onClick={() => navigate(from || '/admin/dashboard')} title="Students">
            <Users size={18} />
            {!sidebarCollapsed && 'Students'}
          </button>
          <button className="admin-nav-item active" title="Student Profile">
            <User size={18} />
            {!sidebarCollapsed && 'Student Profile'}
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
    </>
  );

  if (loading) return (
    <div className="admin-dashboard">
      {renderSidebar()}
      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <div className="loading-state">Loading student details...</div>
      </main>
    </div>
  );
  if (error) return (
    <div className="admin-dashboard">
      {renderSidebar()}
      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <div className="error-state">{error}</div>
      </main>
    </div>
  );
  if (!student) return (
    <div className="admin-dashboard">
      {renderSidebar()}
      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <div className="error-state">Student not found</div>
      </main>
    </div>
  );

  const s = student;
  const u = s.user || {};

  const openEdit = (section) => {
    let form = {};
    switch (section) {
      case 'personal':
        form = {
          fullName: s.user?.fullName || '',
          placementStatus: s.placementStatus || '',
          isVerified: s.isVerified || false,
        };
        break;
      case 'academic':
        form = {
          course: s.course || '',
          department: s.department || '',
          currentYear: s.currentYear || '',
          currentSemester: s.currentSemester || '',
          cgpa: s.cgpa?.toString() || '',
          activeBacklogs: s.activeBacklogs?.toString() || '',
          passiveBacklogs: s.passiveBacklogs?.toString() || '',
          linkedinUrl: s.linkedinUrl || '',
        };
        break;
      default:
        break;
    }
    setEditForm(form);
    setEditingSection(section);
  };

  const updateField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingSection === 'personal') {
        await updateUser(userId, { fullName: editForm.fullName });
        await updateStudentProfile(userId, {
          placementStatus: editForm.placementStatus,
          isVerified: editForm.isVerified,
        });
      } else if (editingSection === 'academic') {
        await updateStudentProfile(userId, {
          course: editForm.course,
          department: editForm.department || null,
          currentYear: parseInt(editForm.currentYear),
          currentSemester: parseInt(editForm.currentSemester),
          cgpa: parseFloat(editForm.cgpa),
          activeBacklogs: parseInt(editForm.activeBacklogs || '0'),
          passiveBacklogs: parseInt(editForm.passiveBacklogs || '0'),
          linkedinUrl: editForm.linkedinUrl || null,
        });
      }
      const res = await getStudentById(userId);
      setStudent(res.data);
      setEditingSection(null);
      setEditForm({});
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const initial = u.fullName?.charAt(0)?.toUpperCase() || 'S';
  const fullName = u.fullName || '';
  const collegeEmail = u.collegeEmail || '';
  const batch = `${s.admissionYear} - ${s.graduationYear}`;
  const courseDisplay = COURSE_LABELS[s.course] || s.course;
  const department = s.department || '';
  const userObj = u;

  return (
    <div className="admin-dashboard">
      {renderSidebar()}
      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <header className="detail-topbar">
          <button className="back-btn" onClick={() => navigate(from || '/admin/dashboard')}>
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
        </header>

        <div className="detail-content">
        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="avatar-initial">{initial}</div>
            <div className="profile-basic-info">
              <div className="profile-name-section">
                <h2>{fullName}</h2>
                <button
                  className={`verified-icon-btn ${s.isVerified ? 'active' : ''}`}
                  onClick={async () => {
                    try {
                      const newVal = !s.isVerified;
                      await updateStudentProfile(userId, { isVerified: newVal });
                      const res = await getStudentById(userId);
                      setStudent(res.data);
                    } catch {}
                  }}
                  title={s.isVerified ? 'Click to unverify' : 'Click to verify'}
                >
                  <CheckCircle size={15} />
                </button>
                <span className={`detail-badge ${s.placementStatus === 'PLACED' ? 'placed' : 'not-placed'}`}>
                  {s.placementStatus === 'PLACED' ? 'Placed' : 'Not Placed'}
                </span>
                <button className="delete-icon-btn" onClick={() => setConfirmDelete(true)} title="Delete Student">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <User size={16} />
                  <span className="detail-label">University Roll No.</span>
                  <span className="detail-value">{s.btuRollNumber}</span>
                </div>
                <div className="detail-item">
                  <Mail size={16} />
                  <span className="detail-label">College Email</span>
                  <span className="detail-value">{collegeEmail}</span>
                </div>
                <div className="detail-item">
                  <GraduationCap size={16} />
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{department || courseDisplay}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span className="detail-label">Batch</span>
                  <span className="detail-value">{batch}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="info-sections">
          {FIELD_SECTIONS.map(section => {
            const IconComponent = ICON_MAP[section.icon] || User;
            const isExpanded = !!expanded[section.id];
            const allFields = getVisibleFields(section, s, userObj, s.document);
            const hasExpandable = allFields.length > (section.primaryCount || 4);
            const canEdit = section.id === 'personal' || section.id === 'academic';

            return (
              <div className="info-card" key={section.id}>
                <div className="info-card-header">
                  <div className="info-card-title">
                    <IconComponent className={`info-icon ${section.iconClass}`} />
                    <h3>{section.title}</h3>
                  </div>
                  {canEdit && (
                    <button className="edit-icon-btn" onClick={() => openEdit(section.id)}>
                      <Edit size={18} />
                    </button>
                  )}
                </div>
                <div className="info-card-body">
                  {allFields.slice(0, section.primaryCount || 4).map(f => (
                    <div className="info-row" key={f.key}>
                      <span className="info-label">{f.label}</span>
                      <span className="info-value">{renderFieldValue(f, f.value)}</span>
                    </div>
                  ))}
                  {hasExpandable && (
                    <div className={`expanded-content ${isExpanded ? 'show' : ''}`}>
                      {allFields.slice(section.primaryCount || 4).map(f => (
                        <div className="info-row" key={f.key}>
                          <span className="info-label">{f.label}</span>
                          <span className="info-value">{renderFieldValue(f, f.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.hasSGPA && s.semesterResults?.length > 0 && (
                    <div className="sgpa-list">
                      <span className="info-label sgpa-title">Semester-wise SGPA</span>
                      <div className="sgpa-grid">
                        {s.semesterResults.map(sr => (
                          <div key={sr.semester} className="sgpa-item">
                            <span className="sgpa-sem">Sem {sr.semester}</span>
                            <span className="sgpa-value">{Number(sr.sgpa).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {hasExpandable && (
                  <button className="view-details-btn" onClick={() => toggleSection(section.id)}>
                    {isExpanded ? 'Show Less' : 'View Details'} {isExpanded ? <ChevronUp size={16} /> : '\u2192'}
                  </button>
                )}
              </div>
            );
          })}

          {(() => {
            const extras = getExtraFields(s, userObj, s.document);
            if (extras.length === 0) return null;
            return (
              <div className="info-card">
                <div className="info-card-header">
                  <div className="info-card-title">
                    <User className="info-icon" />
                    <h3>Additional Information</h3>
                  </div>
                </div>
                <div className="info-card-body">
                  {extras.map(f => (
                    <div className="info-row" key={f.key}>
                      <span className="info-label">{f.label}</span>
                      <span className="info-value">{String(f.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
        </div>
      </main>

      {editingSection && (
        <div className="modal-overlay" onClick={() => setEditingSection(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingSection === 'personal' && 'Edit Personal Information'}
                {editingSection === 'academic' && 'Edit Academic Information'}
              </h2>
              <button className="modal-close-btn" onClick={() => setEditingSection(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {editingSection === 'personal' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Full Name</label>
                    <input type="text" value={editForm.fullName || ''} onChange={e => updateField('fullName', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Placement Status</label>
                    <select value={editForm.placementStatus || ''} onChange={e => updateField('placementStatus', e.target.value)}>
                      <option value="NOT_PLACED">Not Placed</option>
                      <option value="PLACED">Placed</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Verified</label>
                    <select value={editForm.isVerified ? 'yes' : 'no'} onChange={e => updateField('isVerified', e.target.value === 'yes')}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}

              {editingSection === 'academic' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Course</label>
                    <select value={editForm.course || ''} onChange={e => updateField('course', e.target.value)}>
                      {Object.entries(COURSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Department</label>
                    <input type="text" value={editForm.department || ''} onChange={e => updateField('department', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Current Year</label>
                    <select value={editForm.currentYear || ''} onChange={e => updateField('currentYear', e.target.value)}>
                      <option value="">Select year</option>
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Current Semester</label>
                    <input type="number" min="1" max="8" value={editForm.currentSemester || ''} onChange={e => updateField('currentSemester', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>CGPA</label>
                    <input type="number" min="0" max="10" step="0.01" value={editForm.cgpa || ''} onChange={e => updateField('cgpa', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Active Backlogs</label>
                    <input type="number" min="0" value={editForm.activeBacklogs || ''} onChange={e => updateField('activeBacklogs', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Passive Backlogs</label>
                    <input type="number" min="0" value={editForm.passiveBacklogs || ''} onChange={e => updateField('passiveBacklogs', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>LinkedIn URL</label>
                    <input type="url" value={editForm.linkedinUrl || ''} onChange={e => updateField('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setEditingSection(null)} disabled={saving}>Cancel</button>
              <button className="modal-save-btn" onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete <strong>{fullName}</strong>? This will permanently remove all their data.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="confirm-discard-btn" onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
