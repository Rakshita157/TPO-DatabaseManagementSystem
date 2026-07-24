import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Save, X, User, GraduationCap, Phone,
  MapPin, Calendar, FileText, Trash2, ExternalLink, CheckCircle
} from 'lucide-react';
import { getStudentById, updateStudentProfile, updateUser, deleteStudent } from '../../services/admin.service';
import {
  FIELD_SECTIONS, COURSE_LABELS,
  getVisibleFields, getExtraFields
} from '../../config/studentFields';
import './Dashboard.css';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ICON_MAP = { User, GraduationCap, Phone, MapPin, FileText };

export default function StudentDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
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

  const startEdit = () => {
    setEditForm({
      fullName: student.user?.fullName || '',
      course: student.course || '',
      department: student.department || '',
      currentYear: student.currentYear || '',
      currentSemester: student.currentSemester || '',
      cgpa: student.cgpa?.toString() || '',
      activeBacklogs: student.activeBacklogs?.toString() || '',
      passiveBacklogs: student.passiveBacklogs?.toString() || '',
      linkedinUrl: student.linkedinUrl || '',
      placementStatus: student.placementStatus || '',
      isVerified: student.isVerified || false,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(userId, { fullName: editForm.fullName });
      await updateStudentProfile(userId, {
        course: editForm.course,
        department: editForm.department || null,
        currentYear: parseInt(editForm.currentYear),
        currentSemester: parseInt(editForm.currentSemester),
        cgpa: parseFloat(editForm.cgpa),
        activeBacklogs: parseInt(editForm.activeBacklogs || '0'),
        passiveBacklogs: parseInt(editForm.passiveBacklogs || '0'),
        linkedinUrl: editForm.linkedinUrl || null,
        placementStatus: editForm.placementStatus,
        isVerified: editForm.isVerified,
      });
      const res = await getStudentById(userId);
      setStudent(res.data);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(userId);
      navigate('/admin/dashboard');
    } catch {
    }
  };

  if (loading) return <div className="admin-dashboard"><div className="loading-state">Loading student details...</div></div>;
  if (error) return <div className="admin-dashboard"><div className="error-state">{error}</div></div>;
  if (!student) return <div className="admin-dashboard"><div className="error-state">Student not found</div></div>;

  const s = student;
  const u = s.user;
  const batch = `${s.admissionYear} - ${s.graduationYear}`;

  const userObj = u || {};
  const displaySections = ['personal', 'academic', 'school', 'contact', 'address'];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
        </div>
        <div className="admin-header-right">
          {!editing && (
            <>
              <button className="export-btn" onClick={startEdit}><Edit size={18} /> Edit Profile</button>
              <button className="delete-student-btn" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={18} /> Delete Student
              </button>
            </>
          )}
          {editing && (
            <>
              <button className="export-btn" onClick={() => setEditing(false)}><X size={18} /> Cancel</button>
              <button className="add-student-btn" onClick={handleSave} disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="student-detail-grid">
        <div className="student-profile-card">
          <div className="student-avatar-lg">{u?.fullName?.charAt(0)?.toUpperCase()}</div>
          <h2>{u?.fullName}</h2>
          <p className="student-email-lg">{u?.collegeEmail}</p>
          <div className="student-badges">
            {s.isVerified && <span className="detail-badge verified"><CheckCircle size={14} /> Verified</span>}
            <span className={`detail-badge ${s.placementStatus === 'PLACED' ? 'placed' : 'not-placed'}`}>
              {s.placementStatus === 'PLACED' ? 'Placed' : 'Not Placed'}
            </span>
          </div>
          {s.document?.resumeUrl && (
            <a href={s.document.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link-btn">
              <FileText size={16} /> View Resume
            </a>
          )}
          {s.linkedinUrl && (
            <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-profile-btn">
              <ExternalLink size={16} /> LinkedIn Profile
            </a>
          )}
        </div>

        <div className="detail-sections">
          {FIELD_SECTIONS.filter(sec => displaySections.includes(sec.id)).map(section => {
            const IconComponent = ICON_MAP[section.icon] || User;
            const allFields = getVisibleFields(section, s, userObj, s.document);

            return (
              <div className="detail-card" key={section.id}>
                <div className="detail-card-header">
                  <IconComponent className={`detail-icon ${section.iconClass}`} />
                  <h3>{section.title}</h3>
                </div>
                <div className="detail-card-body">
                  {editing && section.id === 'personal' ? (
                    <div className="edit-fields">
                      <div className="edit-field"><label>Full Name</label><input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} /></div>
                      <div className="edit-field"><label>Placement Status</label>
                        <select value={editForm.placementStatus} onChange={e => setEditForm({...editForm, placementStatus: e.target.value})}>
                          <option value="NOT_PLACED">Not Placed</option>
                          <option value="PLACED">Placed</option>
                        </select>
                      </div>
                      <div className="edit-field"><label>Verified</label>
                        <select value={editForm.isVerified ? 'yes' : 'no'} onChange={e => setEditForm({...editForm, isVerified: e.target.value === 'yes'})}>
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                    </div>
                  ) : editing && section.id === 'academic' ? (
                    <div className="edit-fields">
                      <div className="edit-field"><label>Course</label>
                        <select value={editForm.course} onChange={e => setEditForm({...editForm, course: e.target.value})}>
                          {Object.entries(COURSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div className="edit-field"><label>Department</label><input type="text" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} /></div>
                      <div className="edit-field"><label>Current Year</label><input type="number" min="1" max="4" value={editForm.currentYear} onChange={e => setEditForm({...editForm, currentYear: e.target.value})} /></div>
                      <div className="edit-field"><label>Current Semester</label><input type="number" min="1" max="8" value={editForm.currentSemester} onChange={e => setEditForm({...editForm, currentSemester: e.target.value})} /></div>
                      <div className="edit-field"><label>CGPA</label><input type="number" min="0" max="10" step="0.01" value={editForm.cgpa} onChange={e => setEditForm({...editForm, cgpa: e.target.value})} /></div>
                      <div className="edit-field"><label>Active Backlogs</label><input type="number" min="0" value={editForm.activeBacklogs} onChange={e => setEditForm({...editForm, activeBacklogs: e.target.value})} /></div>
                      <div className="edit-field"><label>Passive Backlogs</label><input type="number" min="0" value={editForm.passiveBacklogs} onChange={e => setEditForm({...editForm, passiveBacklogs: e.target.value})} /></div>
                      <div className="edit-field"><label>LinkedIn URL</label><input type="url" value={editForm.linkedinUrl} onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})} /></div>
                    </div>
                  ) : (
                    <>
                      {allFields.map(f => (
                        <div className="detail-row" key={f.key}>
                          <span className="detail-label">{f.label}</span>
                          <span className="detail-value">
                            {f.renderer === 'link' && f.value ? (
                              <a href={f.value} target="_blank" rel="noopener noreferrer" style={{color:'#1e3a8a'}}>{f.value}</a>
                            ) : f.formatter === 'date' ? (
                              formatDate(f.value)
                            ) : f.formatter === 'decimal2' ? (
                              Number(f.value).toFixed(2)
                            ) : f.formatter === 'percent' ? (
                              `${Number(f.value).toFixed(2)}%`
                            ) : f.formatter === 'course' ? (
                              COURSE_LABELS[f.value] || f.value
                            ) : f.fallback ? (
                              f.value || f.fallback
                            ) : (
                              String(f.value ?? 'N/A')
                            )}
                          </span>
                        </div>
                      ))}
                      {section.id === 'academic' && s.semesterResults?.length > 0 && (
                        <div className="sgpa-section">
                          <span className="detail-label sgpa-title">Semester-wise SGPA</span>
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
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {(() => {
            const extras = getExtraFields(s, userObj, s.document);
            if (extras.length === 0) return null;
            return (
              <div className="detail-card">
                <div className="detail-card-header">
                  <User className="detail-icon" />
                  <h3>Additional Information</h3>
                </div>
                <div className="detail-card-body">
                  {extras.map(f => (
                    <div className="detail-row" key={f.key}>
                      <span className="detail-label">{f.label}</span>
                      <span className="detail-value">{String(f.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete <strong>{u?.fullName}</strong>? This will permanently remove all their data.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="confirm-delete" onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
