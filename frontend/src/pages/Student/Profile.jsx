import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ChevronDown, ChevronLeft, ChevronRight, Calendar, FileText,
  User, GraduationCap, Phone, Mail, MapPin,
  Edit, ChevronUp, X, Save, ExternalLink, CheckCircle,
  Home, LogOut, Plus, PanelLeftClose, PanelLeftOpen, Users
} from 'lucide-react';
import {
  getStudentProfile, getSemesterResults, getDocument,
  updateStudentProfile, updateUser, uploadDocument,
  createSemesterResult, updateSemesterResult
} from '../../services/student.service';
import {
  FIELD_SECTIONS, COURSE_LABELS,
  formatFieldValue, getFieldValue, getVisibleFields, getExtraFields
} from '../../config/studentFields';
import * as V from '../../utils/validations';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Profile.css';
import '../Admin/Dashboard.css';

const COURSE_OPTIONS = ['BTECH', 'MTECH', 'MBA', 'MCA'];
const DEPARTMENTS_BY_COURSE = {
  BTECH: ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Artificial Intelligence & Machine Learning'],
  MTECH: ['Computer Science', 'VLSI Design', 'Power Systems', 'Structural Engineering'],
  MBA: ['Marketing', 'Finance', 'Human Resources'],
  MCA: ['Computer Applications'],
};
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
const CURRENT_YEAR = new Date().getFullYear();

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

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

function uppercaseOnChange(setValue, fieldName) {
  return (e) => {
    setValue(fieldName, e.target.value.toUpperCase());
  };
}

function digitsOnChange(setValue, fieldName, maxLen) {
  return (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setValue(fieldName, cleaned);
  };
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [semesterResults, setSemesterResults] = useState([]);
  const [resumeDoc, setResumeDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const pendingCloseRef = useRef(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser.id;

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, semRes, docRes] = await Promise.all([
        getStudentProfile(userId),
        getSemesterResults(userId),
        getDocument(userId),
      ]);
      setProfile(profileRes.data);
      setSemesterResults(semRes.data || []);
      setResumeDoc(docRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [userId, navigate, fetchData]);

  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
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

  const openEdit = (section) => {
    setSaveError('');
    let form = {};
    switch (section) {
      case 'personal':
        form = {
          fullName: storedUser.fullName || '',
          dob: toDateInputValue(profile?.dob),
          gender: profile?.gender || '',
          aadharNumber: profile?.aadharNumber || '',
          panNumber: profile?.panNumber || '',
        };
        break;
      case 'academic':
        form = {
          btuRollNumber: profile?.btuRollNumber || '',
          enrollmentNumber: profile?.enrollmentNumber || '',
          course: profile?.course || '',
          department: profile?.department || '',
          admissionYear: profile?.admissionYear || '',
          graduationYear: profile?.graduationYear || '',
          currentYear: profile?.currentYear || '',
          currentSemester: profile?.currentSemester || '',
          tenthPercentage: profile?.tenthPercentage?.toString() || '',
          tenthYear: profile?.tenthYear || '',
          tenthBoard: profile?.tenthBoard || '',
          twelfthPercentage: profile?.twelfthPercentage?.toString() || '',
          twelfthYear: profile?.twelfthYear || '',
          twelfthBoard: profile?.twelfthBoard || '',
          diplomaPercentage: profile?.diplomaPercentage?.toString() || '',
          diplomaYear: profile?.diplomaYear || '',
          cgpa: profile?.cgpa?.toString() || '',
          activeBacklogs: profile?.activeBacklogs || '',
          passiveBacklogs: profile?.passiveBacklogs || '',
          sgpa: semesterResults.length > 0
            ? semesterResults.map(sr => ({ semester: sr.semester, sgpa: sr.sgpa?.toString() || '' }))
            : [],
        };
        break;
      case 'contact':
        form = {
          phoneNumber: profile?.phoneNumber || '',
          whatsappNumber: profile?.whatsappNumber || '',
          alternatePhone: profile?.alternatePhone || '',
          alternateEmail: profile?.alternateEmail || '',
        };
        break;
      case 'address':
        form = {
          currentAddress: profile?.currentAddress || '',
          permanentAddress: profile?.permanentAddress || '',
          nativeCity: profile?.nativeCity || '',
          nativeDistrict: profile?.nativeDistrict || '',
          nativeState: profile?.nativeState || '',
        };
        break;
      case 'resume':
        form = {
          resumeUrl: resumeDoc?.resumeUrl || '',
          linkedinUrl: profile?.linkedinUrl || '',
        };
        break;
    }
    setEditForm(form);
    setEditingSection(section);
    setHasUnsavedChanges(false);
  };

  const closeEdit = () => {
    if (hasUnsavedChanges) {
      pendingCloseRef.current = true;
      setConfirmClose(true);
      return;
    }
    setEditingSection(null);
    setEditForm({});
    setSaveError('');
    setHasUnsavedChanges(false);
  };

  const confirmCloseEdit = (discard) => {
    setConfirmClose(false);
    if (discard) {
      setEditingSection(null);
      setEditForm({});
      setSaveError('');
      setHasUnsavedChanges(false);
    }
    pendingCloseRef.current = false;
  };

  const handleSave = async (section, data) => {
    setSaving(true);
    setSaveError('');
    try {
      switch (section) {
        case 'personal': {
          await updateUser(userId, { fullName: data.fullName });
          const updatedUser = { ...storedUser, fullName: data.fullName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          await updateStudentProfile(userId, {
            dob: new Date(data.dob).toISOString(),
            gender: data.gender,
            aadharNumber: data.aadharNumber,
            panNumber: data.panNumber || null,
          });
          break;
        }
        case 'academic': {
          const payload = {
            btuRollNumber: data.btuRollNumber,
            enrollmentNumber: data.enrollmentNumber,
            course: data.course,
            department: data.department || null,
            admissionYear: parseInt(data.admissionYear),
            graduationYear: parseInt(data.graduationYear),
            currentYear: parseInt(data.currentYear || '1'),
            currentSemester: parseInt(data.currentSemester),
            tenthPercentage: parseFloat(data.tenthPercentage),
            tenthYear: parseInt(data.tenthYear),
            tenthBoard: data.tenthBoard,
            twelfthPercentage: parseFloat(data.twelfthPercentage),
            twelfthYear: parseInt(data.twelfthYear),
            twelfthBoard: data.twelfthBoard,
            diplomaPercentage: data.diplomaPercentage ? parseFloat(data.diplomaPercentage) : null,
            diplomaYear: data.diplomaYear ? parseInt(data.diplomaYear) : null,
            cgpa: parseFloat(data.cgpa),
            activeBacklogs: parseInt(data.activeBacklogs || '0'),
            passiveBacklogs: parseInt(data.passiveBacklogs || '0'),
          };
          await updateStudentProfile(userId, payload);

          const existingSemesters = new Set(semesterResults.map(sr => sr.semester));
          const sgpaEntries = (data.sgpa || []).filter(s => s.sgpa !== '');
          await Promise.all(
            sgpaEntries.map(entry => {
              if (existingSemesters.has(entry.semester)) {
                return updateSemesterResult(userId, entry.semester, { sgpa: parseFloat(entry.sgpa) });
              }
              return createSemesterResult({ userId, semester: entry.semester, sgpa: parseFloat(entry.sgpa) });
            })
          );
          break;
        }
        case 'contact': {
          await updateStudentProfile(userId, {
            phoneNumber: data.phoneNumber,
            whatsappNumber: data.whatsappNumber,
            alternatePhone: data.alternatePhone || null,
            alternateEmail: data.alternateEmail || null,
          });
          break;
        }
        case 'address': {
          await updateStudentProfile(userId, {
            currentAddress: data.currentAddress,
            permanentAddress: data.permanentAddress,
            nativeCity: data.nativeCity,
            nativeDistrict: data.nativeDistrict,
            nativeState: data.nativeState,
          });
          break;
        }
        case 'resume': {
          const url = data.resumeUrl?.trim();
          if (url) {
            await uploadDocument({ resumeUrl: url });
          }
          await updateStudentProfile(userId, {
            linkedinUrl: data.linkedinUrl || null,
          });
          break;
        }
      }
      setHasUnsavedChanges(false);
      setEditingSection(null);
      setEditForm({});
      setSaveError('');
      setLoading(true);
      await fetchData();
      setToast('Profile updated successfully!');
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!userId) return null;

  if (loading && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '1rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="no-profile-empty">
          <div className="no-profile-card">
            <div className="no-profile-icon-wrapper">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h2 className="no-profile-title">No Profile Found</h2>
            <p className="no-profile-text">
              You haven't completed your student profile yet. Please complete your registration to access your dashboard.
            </p>
            <button className="no-profile-btn" onClick={() => navigate('/student-registration')}>
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initial = storedUser.fullName?.charAt(0)?.toUpperCase() || 'S';
  const fullName = storedUser.fullName || '';
  const collegeEmail = storedUser.collegeEmail || '';
  const batch = `${profile.admissionYear} - ${profile.graduationYear}`;
  const courseDisplay = COURSE_LABELS[profile.course] || profile.course;
  const department = profile.department || '';
  const isVerified = profile.isVerified;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const userObj = { fullName, collegeEmail };

  const renderDynamicFields = (section, isExpanded) => {
    const allFields = getVisibleFields(section, profile, userObj, resumeDoc);
    const primaryCount = section.primaryCount || 4;
    const primaryFields = allFields.slice(0, primaryCount);
    const expandedFields = allFields.slice(primaryCount);

    return (
      <>
        {primaryFields.map(f => (
          <div className="info-row" key={f.key}>
            <span className="info-label">{f.label}</span>
            <span className="info-value">{renderFieldValue(f, f.value)}</span>
          </div>
        ))}
        {expandedFields.length > 0 && (
          <div className={`expanded-content ${isExpanded ? 'show' : ''}`}>
            {expandedFields.map(f => (
              <div className="info-row" key={f.key}>
                <span className="info-label">{f.label}</span>
                <span className="info-value">{renderFieldValue(f, f.value)}</span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderSGPA = () => {
    if (!semesterResults || semesterResults.length === 0) return null;
    const currentSem = parseInt(profile.currentSemester) || 0;
    const filteredResults = semesterResults.filter(sr => sr.semester < currentSem);
    if (filteredResults.length === 0 && currentSem <= 1) return null;
    return (
      <div className="sgpa-list">
        <span className="info-label sgpa-title">Semester-wise SGPA</span>
        {filteredResults.length > 0 ? (
          <div className="sgpa-grid">
            {filteredResults.map(sr => (
              <div key={sr.semester} className="sgpa-item">
                <span className="sgpa-sem">Sem {sr.semester}</span>
                <span className="sgpa-value">{Number(sr.sgpa).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '8px 0 0' }}>No SGPA data available yet.</p>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
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
        <button
          className="sidebar-collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        <button className="admin-nav-item active" title="Profile">
          <Users size={18} />
          {!sidebarCollapsed && 'Profile'}
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
    </>
  );

  return (
    <div className="profile-page">
      {toast && (
        <div className="toast">
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {sidebarCollapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={() => setSidebarCollapsed(false)}
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={!sidebarCollapsed ? { width: sidebarWidth } : undefined}
      >
        {sidebarContent}
        {!sidebarCollapsed && (
          <div
            className="sidebar-resize-handle"
            onMouseDown={startResize}
          />
        )}
      </aside>

      <main className="admin-main" style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}>
        <header className="profile-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <div className="user-menu">
              <div className="avatar-initial-small">{initial}</div>
              <span>{fullName}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="avatar-initial">{initial}</div>
            <div className="profile-basic-info">
              <div className="profile-name-section">
                <h2>{fullName}</h2>
                {isVerified && (
                  <span className="verified-badge">
                    &#x2713; Verified by TPO
                  </span>
                )}
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <User size={16} />
                  <span className="detail-label">University Roll No.</span>
                  <span className="detail-value">{profile.btuRollNumber}</span>
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
            const allFields = getVisibleFields(section, profile, userObj, resumeDoc);
            const hasExpandable = allFields.length > (section.primaryCount || 4);
            const hasOptional = section.fields.some(f => f.optional);
            const optionalPresent = section.fields.some(f => f.optional && profile[f.key] != null && profile[f.key] !== '');

            return (
              <div className="info-card" key={section.id}>
                <div className="info-card-header">
                  <div className="info-card-title">
                    <IconComponent className={`info-icon ${section.iconClass}`} />
                    <h3>{section.title}</h3>
                  </div>
                  <button className="edit-icon-btn" onClick={() => openEdit(section.editKey)}>
                    <Edit size={18} />
                  </button>
                </div>
                <div className="info-card-body">
                  {renderDynamicFields(section, isExpanded)}
                  {section.hasSGPA && renderSGPA()}
                </div>
                {(hasExpandable || (hasOptional && optionalPresent)) && (
                  <button className="view-details-btn" onClick={() => toggleSection(section.id)}>
                    {isExpanded ? 'Show Less' : 'View Details'} {isExpanded ? <ChevronUp size={16} /> : '\u2192'}
                  </button>
                )}
              </div>
            );
          })}

          {(() => {
            const extras = getExtraFields(profile, userObj, resumeDoc);
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
      </main>

      {editingSection && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingSection === 'personal' && 'Edit Personal Information'}
                {editingSection === 'academic' && 'Edit Academic Information'}
                {editingSection === 'contact' && 'Edit Contact Information'}
                {editingSection === 'address' && 'Edit Address & Location'}
                {editingSection === 'resume' && 'Resume & LinkedIn'}
              </h2>
              <button className="modal-close-btn" onClick={closeEdit}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {saveError && (
                <div className="modal-error">
                  {saveError}
                </div>
              )}

              {editingSection === 'personal' && (
                <PersonalEditForm
                  initialData={editForm}
                  onSave={(data) => handleSave('personal', data)}
                  onCancel={closeEdit}
                  saving={saving}
                  onDirtyChange={setHasUnsavedChanges}
                />
              )}
              {editingSection === 'academic' && (
                <AcademicEditForm
                  initialData={editForm}
                  onSave={(data) => handleSave('academic', data)}
                  onCancel={closeEdit}
                  saving={saving}
                  onDirtyChange={setHasUnsavedChanges}
                />
              )}
              {editingSection === 'contact' && (
                <ContactEditForm
                  initialData={editForm}
                  onSave={(data) => handleSave('contact', data)}
                  onCancel={closeEdit}
                  saving={saving}
                  onDirtyChange={setHasUnsavedChanges}
                />
              )}
              {editingSection === 'address' && (
                <AddressEditForm
                  initialData={editForm}
                  onSave={(data) => handleSave('address', data)}
                  onCancel={closeEdit}
                  saving={saving}
                  onDirtyChange={setHasUnsavedChanges}
                />
              )}
              {editingSection === 'resume' && (
                <ResumeEditForm
                  initialData={editForm}
                  onSave={(data) => handleSave('resume', data)}
                  onCancel={closeEdit}
                  saving={saving}
                  onDirtyChange={setHasUnsavedChanges}
                />
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={closeEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClose && (
        <div className="modal-overlay" onClick={() => confirmCloseEdit(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. Are you sure you want to discard them?</p>
            <div className="confirm-actions">
              <button className="confirm-cancel-btn" onClick={() => confirmCloseEdit(false)}>
                Keep Editing
              </button>
              <button className="confirm-discard-btn" onClick={() => confirmCloseEdit(true)}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalEditForm({ initialData, onSave, onCancel, saving, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    mode: 'onSubmit',
    defaultValues: initialData,
  });

  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  return (
    <form className="modal-form" onSubmit={handleSubmit(onSave)}>
      <div className="modal-field">
        <label>Full Name</label>
        <input type="text" {...register('fullName', V.fullName())} />
        {errors.fullName && <span className="field-error-msg">{errors.fullName.message}</span>}
      </div>
      <div className="modal-field">
        <label>Date of Birth</label>
        <input type="date" {...register('dob', V.ageRange(15, 30))} />
        {errors.dob && <span className="field-error-msg">{errors.dob.message}</span>}
      </div>
      <div className="modal-field">
        <label>Gender</label>
        <select {...register('gender', V.genderSelect())}>
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <span className="field-error-msg">{errors.gender.message}</span>}
      </div>
      <div className="modal-field">
        <label>Aadhar Number</label>
        <input type="text" placeholder="12-digit Aadhar number" {...register('aadharNumber', V.aadhar())} />
        {errors.aadharNumber && <span className="field-error-msg">{errors.aadharNumber.message}</span>}
      </div>
      <div className="modal-field">
        <label>PAN Number</label>
        <input type="text" placeholder="e.g. ABCDE1234F" {...register('panNumber', V.pan())} />
        {errors.panNumber && <span className="field-error-msg">{errors.panNumber.message}</span>}
      </div>
      <button type="submit" className="modal-save-btn" disabled={saving}>
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function AcademicEditForm({ initialData, onSave, onCancel, saving, onDirtyChange }) {
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isDirty } } = useForm({
    mode: 'onSubmit',
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'sgpa' });

  const watchedCourse = watch('course');
  const watchedAdmissionYear = watch('admissionYear');

  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (watchedAdmissionYear && watchedCourse) {
      const duration = watchedCourse === 'BTECH' ? 4 : 2;
      const gradYear = parseInt(watchedAdmissionYear) + duration;
      setValue('graduationYear', String(gradYear));
    }
  }, [watchedAdmissionYear, watchedCourse, setValue]);

  return (
    <form className="modal-form" onSubmit={handleSubmit(onSave)}>
      <div className="modal-field">
        <label>University Roll No.</label>
        <input type="text" {...register('btuRollNumber', V.selectRequired('BTU roll number'))} onChange={uppercaseOnChange(setValue, 'btuRollNumber')} />
        {errors.btuRollNumber && <span className="field-error-msg">{errors.btuRollNumber.message}</span>}
      </div>
      <div className="modal-field">
        <label>Enrollment Number</label>
        <input type="text" {...register('enrollmentNumber', V.selectRequired('enrollment number'))} onChange={uppercaseOnChange(setValue, 'enrollmentNumber')} />
        {errors.enrollmentNumber && <span className="field-error-msg">{errors.enrollmentNumber.message}</span>}
      </div>
      <div className="modal-field">
        <label>Course</label>
        <select {...register('course', V.selectRequired('course'))} onChange={(e) => {
          register('course').onChange(e);
          setValue('department', '');
        }}>
          <option value="">Select course</option>
          {COURSE_OPTIONS.map(c => <option key={c} value={c}>{COURSE_LABELS[c]}</option>)}
        </select>
        {errors.course && <span className="field-error-msg">{errors.course.message}</span>}
      </div>
      <div className="modal-field">
        <label>Department / Branch</label>
        <select {...register('department', V.selectRequired('department'))} disabled={!watchedCourse}>
          <option value="">{watchedCourse ? 'Select department' : 'Select a course first'}</option>
          {(DEPARTMENTS_BY_COURSE[watchedCourse] || []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.department && <span className="field-error-msg">{errors.department.message}</span>}
      </div>
      <div className="modal-field">
        <label>Admission Year</label>
        <select {...register('admissionYear', V.yearSelect('admission year'))}>
          <option value="">Select year</option>
          {Array.from({ length: 10 }, (_, i) => `${CURRENT_YEAR - 9 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {errors.admissionYear && <span className="field-error-msg">{errors.admissionYear.message}</span>}
      </div>
      <div className="modal-field">
        <label>Graduation Year</label>
        <input type="text" readOnly {...register('graduationYear', V.yearSelect('graduation year'))} />
      </div>
      <div className="modal-field">
        <label>Current Year</label>
        <select {...register('currentYear', V.selectRequired('current year'))}>
          <option value="">Select year</option>
          {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>)}
        </select>
        {errors.currentYear && <span className="field-error-msg">{errors.currentYear.message}</span>}
      </div>
      <div className="modal-field">
        <label>Current Semester</label>
        <select {...register('currentSemester', V.selectRequired('semester'))}>
          <option value="">Select semester</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.currentSemester && <span className="field-error-msg">{errors.currentSemester.message}</span>}
      </div>

      <h4 className="modal-section-label">10th Standard</h4>
      <div className="modal-field">
        <label>Percentage</label>
        <input type="text" placeholder="e.g. 85.5" {...register('tenthPercentage', V.percentage('10th percentage'))} />
        {errors.tenthPercentage && <span className="field-error-msg">{errors.tenthPercentage.message}</span>}
      </div>
      <div className="modal-field">
        <label>Year of Passing</label>
        <select {...register('tenthYear', V.yearSelect('10th year'))}>
          <option value="">Select year</option>
          {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {errors.tenthYear && <span className="field-error-msg">{errors.tenthYear.message}</span>}
      </div>
      <div className="modal-field">
        <label>Board</label>
        <input type="text" placeholder="e.g. RBSE, CBSE" {...register('tenthBoard', V.selectRequired('10th board'))} onChange={uppercaseOnChange(setValue, 'tenthBoard')} />
        {errors.tenthBoard && <span className="field-error-msg">{errors.tenthBoard.message}</span>}
      </div>

      <h4 className="modal-section-label">12th Standard</h4>
      <div className="modal-field">
        <label>Percentage</label>
        <input type="text" placeholder="e.g. 80.0" {...register('twelfthPercentage', V.percentage('12th percentage'))} />
        {errors.twelfthPercentage && <span className="field-error-msg">{errors.twelfthPercentage.message}</span>}
      </div>
      <div className="modal-field">
        <label>Year of Passing</label>
        <select {...register('twelfthYear', V.yearSelect('12th year'))}>
          <option value="">Select year</option>
          {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {errors.twelfthYear && <span className="field-error-msg">{errors.twelfthYear.message}</span>}
      </div>
      <div className="modal-field">
        <label>Board</label>
        <input type="text" placeholder="e.g. RBSE, CBSE" {...register('twelfthBoard', V.selectRequired('12th board'))} onChange={uppercaseOnChange(setValue, 'twelfthBoard')} />
        {errors.twelfthBoard && <span className="field-error-msg">{errors.twelfthBoard.message}</span>}
      </div>

      <h4 className="modal-section-label">Diploma (if applicable)</h4>
      <div className="modal-field">
        <label>Percentage</label>
        <input type="text" placeholder="e.g. 78.0" {...register('diplomaPercentage', V.optionalPercentage())} />
        {errors.diplomaPercentage && <span className="field-error-msg">{errors.diplomaPercentage.message}</span>}
      </div>
      <div className="modal-field">
        <label>Year of Passing</label>
        <select {...register('diplomaYear')}>
          <option value="">Select year</option>
          {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <h4 className="modal-section-label">Current Performance</h4>
      <div className="modal-field">
        <label>CGPA</label>
        <input type="text" placeholder="e.g. 8.5" {...register('cgpa', V.cgpa())} />
        {errors.cgpa && <span className="field-error-msg">{errors.cgpa.message}</span>}
      </div>
      <div className="modal-field">
        <label>Active Backlogs</label>
        <input type="text" placeholder="0" {...register('activeBacklogs', V.nonNegativeInt('Active backlogs'))} />
        {errors.activeBacklogs && <span className="field-error-msg">{errors.activeBacklogs.message}</span>}
      </div>
      <div className="modal-field">
        <label>Passive Backlogs</label>
        <input type="text" placeholder="0" {...register('passiveBacklogs', V.nonNegativeInt('Passive backlogs'))} />
        {errors.passiveBacklogs && <span className="field-error-msg">{errors.passiveBacklogs.message}</span>}
      </div>

      <h4 className="modal-section-label">Semester SGPA</h4>
      {fields.length > 0 ? (
        <div className="modal-sgpa-grid">
          {fields.map((field, index) => (
            <div key={field.id} className="modal-sgpa-card">
              <div className="modal-sgpa-card-header">
                <span className="modal-sgpa-badge">Sem {field.semester}</span>
                <button type="button" className="modal-sgpa-remove-btn" onClick={() => remove(index)}>
                  <X size={12} />
                </button>
              </div>
              <input
                type="text"
                className="modal-sgpa-input"
                {...register(`sgpa.${index}.sgpa`, V.sgpa())}
                placeholder="e.g. 8.5"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="modal-sgpa-empty">No SGPA entries yet. Add your semester-wise SGPA below.</p>
      )}
      <button type="button" className="modal-sgpa-add-btn" onClick={() => {
        const nextSem = fields.length > 0 ? Math.max(...fields.map(f => f.semester)) + 1 : 1;
        append({ semester: nextSem, sgpa: '' });
      }}>
        <Plus size={14} />
        Add Semester
      </button>

      <button type="submit" className="modal-save-btn" disabled={saving}>
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function ContactEditForm({ initialData, onSave, onCancel, saving, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    mode: 'onSubmit',
    defaultValues: initialData,
  });

  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  return (
    <form className="modal-form" onSubmit={handleSubmit(onSave)}>
      <div className="modal-field">
        <label>Mobile Number</label>
        <input type="tel" placeholder="9876543210" {...register('phoneNumber', V.phone10('Mobile number'))} />
        {errors.phoneNumber && <span className="field-error-msg">{errors.phoneNumber.message}</span>}
      </div>
      <div className="modal-field">
        <label>WhatsApp Number</label>
        <input type="tel" placeholder="WhatsApp number" {...register('whatsappNumber', V.phone10('WhatsApp number'))} />
        {errors.whatsappNumber && <span className="field-error-msg">{errors.whatsappNumber.message}</span>}
      </div>
      <div className="modal-field">
        <label>Alternate Phone</label>
        <input type="tel" placeholder="Alternate phone (optional)" {...register('alternatePhone', V.optionalPhone10())} />
        {errors.alternatePhone && <span className="field-error-msg">{errors.alternatePhone.message}</span>}
      </div>
      <div className="modal-field">
        <label>Personal Email</label>
        <input type="email" placeholder="your@email.com" {...register('alternateEmail', V.optionalEmail())} />
        {errors.alternateEmail && <span className="field-error-msg">{errors.alternateEmail.message}</span>}
      </div>
      <button type="submit" className="modal-save-btn" disabled={saving}>
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function AddressEditForm({ initialData, onSave, onCancel, saving, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    mode: 'onSubmit',
    defaultValues: initialData,
  });

  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  return (
    <form className="modal-form" onSubmit={handleSubmit(onSave)}>
      <div className="modal-field">
        <label>Current Address</label>
        <textarea rows={3} placeholder="Enter current address" {...register('currentAddress', V.address('Current address'))} />
        {errors.currentAddress && <span className="field-error-msg">{errors.currentAddress.message}</span>}
      </div>
      <div className="modal-field">
        <label>Permanent Address</label>
        <textarea rows={3} placeholder="Enter permanent address" {...register('permanentAddress', V.address('Permanent address'))} />
        {errors.permanentAddress && <span className="field-error-msg">{errors.permanentAddress.message}</span>}
      </div>
      <div className="modal-field">
        <label>City</label>
        <input type="text" placeholder="Enter city" {...register('nativeCity', V.city('City'))} />
        {errors.nativeCity && <span className="field-error-msg">{errors.nativeCity.message}</span>}
      </div>
      <div className="modal-field">
        <label>District</label>
        <input type="text" placeholder="Enter district" {...register('nativeDistrict', V.city('District'))} />
        {errors.nativeDistrict && <span className="field-error-msg">{errors.nativeDistrict.message}</span>}
      </div>
      <div className="modal-field">
        <label>State</label>
        <select {...register('nativeState', V.stateSelect())}>
          <option value="">Select state</option>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.nativeState && <span className="field-error-msg">{errors.nativeState.message}</span>}
      </div>
      <button type="submit" className="modal-save-btn" disabled={saving}>
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function ResumeEditForm({ initialData, onSave, onCancel, saving, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    mode: 'onSubmit',
    defaultValues: initialData,
  });

  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  return (
    <form className="modal-form" onSubmit={handleSubmit(onSave)}>
      <div className="modal-field">
        <label>Resume Link</label>
        <input type="url" placeholder="https://drive.google.com/file/d/..." {...register('resumeUrl', V.resumeUrl())} />
        <span className="modal-field-hint">Paste your Google Drive or cloud storage link</span>
        {errors.resumeUrl && <span className="field-error-msg">{errors.resumeUrl.message}</span>}
      </div>
      <div className="modal-field">
        <label>LinkedIn URL</label>
        <input type="url" placeholder="https://linkedin.com/in/username" {...register('linkedinUrl', V.linkedinUrl())} />
        {errors.linkedinUrl && <span className="field-error-msg">{errors.linkedinUrl.message}</span>}
      </div>
      <button type="submit" className="modal-save-btn" disabled={saving}>
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
