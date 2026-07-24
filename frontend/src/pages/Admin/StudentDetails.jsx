import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronUp, Calendar, FileText,
  User, GraduationCap, Phone, Mail, MapPin,
  Edit, X, Save, ExternalLink, CheckCircle, Trash2
} from 'lucide-react';
import { getStudentById, updateStudentProfile, updateUser, deleteStudent } from '../../services/admin.service';
import {
  FIELD_SECTIONS, COURSE_LABELS,
  formatFieldValue, getVisibleFields, getExtraFields
} from '../../config/studentFields';
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
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      navigate('/admin/dashboard');
    } catch {
    }
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openEdit = (section) => {
    const s = student;
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

  if (loading) return <div className="admin-dashboard"><div className="loading-state">Loading student details...</div></div>;
  if (error) return <div className="admin-dashboard"><div className="error-state">{error}</div></div>;
  if (!student) return <div className="admin-dashboard"><div className="error-state">Student not found</div></div>;

  const s = student;
  const u = s.user || {};
  const initial = u.fullName?.charAt(0)?.toUpperCase() || 'S';
  const fullName = u.fullName || '';
  const collegeEmail = u.collegeEmail || '';
  const batch = `${s.admissionYear} - ${s.graduationYear}`;
  const courseDisplay = COURSE_LABELS[s.course] || s.course;
  const department = s.department || '';
  const userObj = u;

  return (
    <div className="admin-dashboard">
      <header className="detail-topbar">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button className="delete-student-btn" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={18} /> Delete Student
        </button>
      </header>

      <div className="detail-content">
        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="avatar-initial">{initial}</div>
            <div className="profile-basic-info">
              <div className="profile-name-section">
                <h2>{fullName}</h2>
                {s.isVerified && (
                  <span className="verified-badge">
                    <CheckCircle size={13} /> Verified by TPO
                  </span>
                )}
                <span className={`detail-badge ${s.placementStatus === 'PLACED' ? 'placed' : 'not-placed'}`}>
                  {s.placementStatus === 'PLACED' ? 'Placed' : 'Not Placed'}
                </span>
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
