import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Save, X, User, Mail, GraduationCap, Phone,
  MapPin, Calendar, FileText, Trash2, ExternalLink, CheckCircle
} from 'lucide-react';
import { getStudentById, updateStudentProfile, updateUser, deleteStudent } from '../../services/admin.service';
import './Dashboard.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

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
  const [expanded, setExpanded] = useState({});

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

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          <div className="detail-card">
            <div className="detail-card-header">
              <User className="detail-icon" />
              <h3>Personal Information</h3>
            </div>
            <div className="detail-card-body">
              {editing ? (
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
              ) : (
                <>
                  <div className="detail-row"><span className="detail-label">Full Name</span><span className="detail-value">{u?.fullName}</span></div>
                  <div className="detail-row"><span className="detail-label">Date of Birth</span><span className="detail-value">{formatDate(s.dob)}</span></div>
                  <div className="detail-row"><span className="detail-label">Gender</span><span className="detail-value">{s.gender}</span></div>
                  <div className="detail-row"><span className="detail-label">Aadhar Number</span><span className="detail-value">{s.aadharNumber}</span></div>
                  <div className={`expanded-content ${expanded.personal ? 'show' : ''}`}>
                    <div className="detail-row"><span className="detail-label">PAN Number</span><span className="detail-value">{s.panNumber || 'N/A'}</span></div>
                  </div>
                </>
              )}
            </div>
            {!editing && <button className="view-details-btn" onClick={() => toggleSection('personal')}>{expanded.personal ? 'Show Less' : 'View Details'}</button>}
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <GraduationCap className="detail-icon green" />
              <h3>Academic Information</h3>
            </div>
            <div className="detail-card-body">
              {editing ? (
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
                  <div className="detail-row"><span className="detail-label">University Roll No.</span><span className="detail-value">{s.btuRollNumber}</span></div>
                  <div className="detail-row"><span className="detail-label">Enrollment No.</span><span className="detail-value">{s.enrollmentNumber}</span></div>
                  <div className="detail-row"><span className="detail-label">College ID</span><span className="detail-value">{s.collegeId}</span></div>
                  <div className="detail-row"><span className="detail-label">Course</span><span className="detail-value">{COURSE_LABELS[s.course]}</span></div>
                  <div className="detail-row"><span className="detail-label">Department</span><span className="detail-value">{s.department || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Batch</span><span className="detail-value">{batch}</span></div>
                  <div className="detail-row"><span className="detail-label">Current Year</span><span className="detail-value">{s.currentYear}</span></div>
                  <div className="detail-row"><span className="detail-label">Current Semester</span><span className="detail-value">{s.currentSemester}</span></div>
                  <div className={`expanded-content ${expanded.academic ? 'show' : ''}`}>
                    <div className="detail-row"><span className="detail-label">CGPA</span><span className="detail-value">{Number(s.cgpa).toFixed(2)}</span></div>
                    <div className="detail-row"><span className="detail-label">Active Backlogs</span><span className="detail-value">{s.activeBacklogs}</span></div>
                    <div className="detail-row"><span className="detail-label">Passive Backlogs</span><span className="detail-value">{s.passiveBacklogs}</span></div>
                    <div className="detail-row"><span className="detail-label">LinkedIn</span><span className="detail-value">{s.linkedinUrl ? <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{color:'#1e3a8a'}}>{s.linkedinUrl}</a> : 'N/A'}</span></div>
                    {s.semesterResults?.length > 0 && (
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
                  </div>
                </>
              )}
            </div>
            {!editing && <button className="view-details-btn" onClick={() => toggleSection('academic')}>{expanded.academic ? 'Show Less' : 'View Details'}</button>}
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <Phone className="detail-icon orange" />
              <h3>Contact Information</h3>
            </div>
            <div className="detail-card-body">
              <div className="detail-row"><span className="detail-label">College Email</span><span className="detail-value">{u?.collegeEmail}</span></div>
              <div className="detail-row"><span className="detail-label">Mobile Number</span><span className="detail-value">{s.phoneNumber}</span></div>
              <div className="detail-row"><span className="detail-label">WhatsApp Number</span><span className="detail-value">{s.whatsappNumber}</span></div>
              <div className={`expanded-content ${expanded.contact ? 'show' : ''}`}>
                {s.alternatePhone && <div className="detail-row"><span className="detail-label">Alternate Phone</span><span className="detail-value">{s.alternatePhone}</span></div>}
                {s.alternateEmail && <div className="detail-row"><span className="detail-label">Personal Email</span><span className="detail-value">{s.alternateEmail}</span></div>}
              </div>
            </div>
            <button className="view-details-btn" onClick={() => toggleSection('contact')}>{expanded.contact ? 'Show Less' : 'View Details'}</button>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <MapPin className="detail-icon" />
              <h3>Address</h3>
            </div>
            <div className="detail-card-body">
              <div className="detail-row"><span className="detail-label">Current Address</span><span className="detail-value">{s.currentAddress}</span></div>
              <div className="detail-row"><span className="detail-label">Permanent Address</span><span className="detail-value">{s.permanentAddress}</span></div>
              <div className="detail-row"><span className="detail-label">City</span><span className="detail-value">{s.nativeCity}</span></div>
              <div className={`expanded-content ${expanded.address ? 'show' : ''}`}>
                <div className="detail-row"><span className="detail-label">District</span><span className="detail-value">{s.nativeDistrict}</span></div>
                <div className="detail-row"><span className="detail-label">State</span><span className="detail-value">{s.nativeState}</span></div>
              </div>
            </div>
            <button className="view-details-btn" onClick={() => toggleSection('address')}>{expanded.address ? 'Show Less' : 'View Details'}</button>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <GraduationCap className="detail-icon orange" />
              <h3>School Information</h3>
            </div>
            <div className="detail-card-body">
              <div className="detail-row"><span className="detail-label">10th Board</span><span className="detail-value">{s.tenthBoard}</span></div>
              <div className="detail-row"><span className="detail-label">10th Percentage</span><span className="detail-value">{Number(s.tenthPercentage).toFixed(2)}%</span></div>
              <div className="detail-row"><span className="detail-label">10th Passing Year</span><span className="detail-value">{s.tenthYear}</span></div>
              <div className="detail-row"><span className="detail-label">12th Board</span><span className="detail-value">{s.twelfthBoard}</span></div>
              <div className="detail-row"><span className="detail-label">12th Percentage</span><span className="detail-value">{Number(s.twelfthPercentage).toFixed(2)}%</span></div>
              <div className="detail-row"><span className="detail-label">12th Passing Year</span><span className="detail-value">{s.twelfthYear}</span></div>
              <div className={`expanded-content ${expanded.school ? 'show' : ''}`}>
                {s.diplomaPercentage != null && <div className="detail-row"><span className="detail-label">Diploma Percentage</span><span className="detail-value">{Number(s.diplomaPercentage).toFixed(2)}%</span></div>}
                {s.diplomaYear != null && <div className="detail-row"><span className="detail-label">Diploma Year</span><span className="detail-value">{s.diplomaYear}</span></div>}
              </div>
            </div>
            {(s.diplomaPercentage != null || s.diplomaYear != null) && (
              <button className="view-details-btn" onClick={() => toggleSection('school')}>{expanded.school ? 'Show Less' : 'View Details'}</button>
            )}
          </div>
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
