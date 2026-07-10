import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, ChevronDown, Calendar, FileText, 
  User, GraduationCap, Phone, Mail, MapPin,
  Edit, Eye, RefreshCw, Headphones, Clock, ChevronUp, X, Save
} from 'lucide-react';
import { 
  getStudentProfile, getSemesterResults, getDocument,
  updateStudentProfile, updateUser, uploadDocument
} from '../../services/student.service';
import './Profile.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };
const COURSE_OPTIONS = ['BTECH', 'MTECH', 'MBA', 'MCA'];
const DEPARTMENTS_BY_COURSE = {
  BTECH: ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Artificial Intelligence & Machine Learning'],
  MTECH: ['Computer Science', 'VLSI Design', 'Power Systems', 'Structural Engineering'],
  MCA: ['Computer Applications'],
};
const MBA_SPECIALIZATIONS = ['Marketing', 'Finance', 'Human Resources'];
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

const REQUIRED_COMPLETION_FIELDS = [
  'btuRollNumber', 'enrollmentNumber', 'collegeId',
  'course', 'admissionYear', 'graduationYear', 'currentYear', 'currentSemester',
  'dob', 'gender',
  'phoneNumber', 'whatsappNumber',
  'currentAddress', 'permanentAddress', 'nativeCity', 'nativeDistrict', 'nativeState',
  'aadharNumber',
  'tenthPercentage', 'tenthYear', 'tenthBoard',
  'twelfthPercentage', 'twelfthYear', 'twelfthBoard',
  'cgpa',
];

function computeCompletion(profile) {
  if (!profile) return { percentage: 0, filled: 0, total: REQUIRED_COMPLETION_FIELDS.length };
  const filled = REQUIRED_COMPLETION_FIELDS.filter(f => {
    const val = profile[f];
    return val !== null && val !== undefined && val !== '';
  }).length;
  return {
    percentage: Math.round((filled / REQUIRED_COMPLETION_FIELDS.length) * 100),
    filled,
    total: REQUIRED_COMPLETION_FIELDS.length,
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

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          mbaSpecialization1: profile?.mbaSpecialization1 || '',
          mbaSpecialization2: profile?.mbaSpecialization2 || '',
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
          linkedinUrl: profile?.linkedinUrl || '',
        };
        break;
      case 'resume':
        form = { resumeUrl: resumeDoc?.resumeUrl || '' };
        break;
    }
    setEditForm(form);
    setEditingSection(section);
  };

  const closeEdit = () => {
    setEditingSection(null);
    setEditForm({});
    setSaveError('');
  };

  const updateField = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      switch (editingSection) {
        case 'personal': {
          await updateUser(userId, { fullName: editForm.fullName });
          const updatedUser = { ...storedUser, fullName: editForm.fullName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          await updateStudentProfile(userId, {
            dob: new Date(editForm.dob).toISOString(),
            gender: editForm.gender,
            aadharNumber: editForm.aadharNumber,
            panNumber: editForm.panNumber || null,
          });
          break;
        }
        case 'academic': {
          const payload = {
            btuRollNumber: editForm.btuRollNumber,
            enrollmentNumber: editForm.enrollmentNumber,
            course: editForm.course,
            department: editForm.course === 'MBA' ? null : editForm.department || null,
            mbaSpecialization1: editForm.course === 'MBA' ? editForm.mbaSpecialization1 || null : null,
            mbaSpecialization2: editForm.course === 'MBA' ? editForm.mbaSpecialization2 || null : null,
            admissionYear: parseInt(editForm.admissionYear),
            graduationYear: parseInt(editForm.graduationYear),
            currentYear: parseInt(editForm.currentYear || '1'),
            currentSemester: parseInt(editForm.currentSemester),
            tenthPercentage: parseFloat(editForm.tenthPercentage),
            tenthYear: parseInt(editForm.tenthYear),
            tenthBoard: editForm.tenthBoard,
            twelfthPercentage: parseFloat(editForm.twelfthPercentage),
            twelfthYear: parseInt(editForm.twelfthYear),
            twelfthBoard: editForm.twelfthBoard,
            diplomaPercentage: editForm.diplomaPercentage ? parseFloat(editForm.diplomaPercentage) : null,
            diplomaYear: editForm.diplomaYear ? parseInt(editForm.diplomaYear) : null,
            cgpa: parseFloat(editForm.cgpa),
            activeBacklogs: parseInt(editForm.activeBacklogs || '0'),
            passiveBacklogs: parseInt(editForm.passiveBacklogs || '0'),
          };
          await updateStudentProfile(userId, payload);
          break;
        }
        case 'contact': {
          await updateStudentProfile(userId, {
            phoneNumber: editForm.phoneNumber,
            whatsappNumber: editForm.whatsappNumber,
            alternatePhone: editForm.alternatePhone || null,
            alternateEmail: editForm.alternateEmail || null,
          });
          break;
        }
        case 'address': {
          await updateStudentProfile(userId, {
            currentAddress: editForm.currentAddress,
            permanentAddress: editForm.permanentAddress,
            nativeCity: editForm.nativeCity,
            nativeDistrict: editForm.nativeDistrict,
            nativeState: editForm.nativeState,
            linkedinUrl: editForm.linkedinUrl || null,
          });
          break;
        }
        case 'resume': {
          const url = editForm.resumeUrl?.trim();
          if (url) {
            await uploadDocument({ resumeUrl: url });
          }
          break;
        }
      }
      closeEdit();
      setLoading(true);
      await fetchData();
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
        <div className="profile-main" style={{ marginLeft: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-main" style={{ marginLeft: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-main" style={{ marginLeft: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No profile found. Please complete your registration first.</p>
          <button className="edit-profile-btn" onClick={() => navigate('/student-registration')} style={{ width: 'auto', padding: '12px 32px' }}>
            Complete Registration
          </button>
        </div>
      </div>
    );
  }

  const initial = storedUser.fullName?.charAt(0)?.toUpperCase() || 'S';
  const fullName = storedUser.fullName || '';
  const collegeEmail = storedUser.collegeEmail || '';
  const batch = `${profile.admissionYear} - ${profile.graduationYear}`;
  const courseDisplay = COURSE_LABELS[profile.course] || profile.course;
  const department = profile.department || profile.mbaSpecialization1 || '';
  const isVerified = profile.isVerified;
  const lastUpdated = formatDate(profile.updatedAt);

  const completion = computeCompletion(profile);
  const resumeUploadedOn = formatDate(resumeDoc?.uploadedAt);
  const resumeUrl = resumeDoc?.resumeUrl || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">&#x1F393;</div>
            <div className="logo-text">
              <div className="logo-title">Training &</div>
              <div className="logo-title">Placement Cell</div>
              <div className="logo-subtitle">GWECA, Ajmer</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="nav-icon">&#x1F3E0;</span>
            Dashboard
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">&#x1F6AA;</span>
            Logout
          </button>
        </nav>

        <div className="sidebar-section">
          <div className="section-title">PROFILE UPDATE</div>
          <div className="update-alert">
            <Bell className="alert-icon" />
            <p>Keep your profile updated for better placement opportunities.</p>
          </div>
          <button className="update-btn">
            Update Now <ChevronDown size={16} />
          </button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">NEED ASSISTANCE?</div>
          <div className="help-section">
            <Headphones className="help-icon" />
            <h4>We're here to help!</h4>
            <p>For any queries related to profile, resume or portal.</p>
            <div className="help-contacts">
              <div className="help-contact-item">
                <Mail size={14} />
                tpo@gweca.ac.in
              </div>
              <div className="help-contact-item">
                <Phone size={14} />
                +91 87654 32109
              </div>
              <div className="help-contact-item">
                <Clock size={14} />
                Mon - Fri | 9:00 AM - 5:00 PM
              </div>
            </div>
            <button className="contact-tpo-btn">
              Contact TPO <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>&copy; 2025 T&P Cell</p>
          <p>All rights reserved.</p>
        </div>
      </aside>

      <main className="profile-main">
        <header className="profile-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
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

        <section className="quick-stats">
          <div className="stat-card">
            <Calendar className="stat-icon blue" />
            <div className="stat-content">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{lastUpdated || 'N/A'}</span>
            </div>
          </div>
          <div className="stat-card">
            <FileText className="stat-icon green" />
            <div className="stat-content">
              <span className="stat-label">Resume</span>
              <span className="stat-value success">{resumeDoc ? 'Uploaded' : 'Not Uploaded'}</span>
            </div>
          </div>
          <div className="stat-card">
            <User className="stat-icon purple" />
            <div className="stat-content">
              <span className="stat-label">Profile Completion</span>
              <span className="stat-value">{completion.percentage === 100 ? '100%' : `${completion.percentage}%`}</span>
            </div>
          </div>
        </section>

        <section className="info-sections">
          {/* Personal Information */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <User className="info-icon" />
                <h3>Personal Information</h3>
              </div>
              <button className="edit-icon-btn" onClick={() => openEdit('personal')}>
                <Edit size={18} />
              </button>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{formatDate(profile.dob)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Gender</span>
                <span className="info-value">{profile.gender}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Aadhar Number</span>
                <span className="info-value">{profile.aadharNumber}</span>
              </div>
              <div className={`expanded-content ${expanded.personal ? 'show' : ''}`}>
                <div className="info-row">
                  <span className="info-label">PAN Number</span>
                  <span className="info-value">{profile.panNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
            <button className="view-details-btn" onClick={() => toggleSection('personal')}>
              {expanded.personal ? 'Show Less' : 'View Details'} {expanded.personal ? <ChevronUp size={16} /> : '\u2192'}
            </button>
          </div>

          {/* Academic Information */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <GraduationCap className="info-icon green" />
                <h3>Academic Information</h3>
              </div>
              <button className="edit-icon-btn" onClick={() => openEdit('academic')}>
                <Edit size={18} />
              </button>
            </div>
            <div className="info-card-body">
              <h4 className="section-subheader">University Info</h4>
              <div className="info-grid-three">
                <div className="info-grid-item">
                  <span className="info-label">University Roll No.</span>
                  <span className="info-value">{profile.btuRollNumber}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Enrollment No.</span>
                  <span className="info-value">{profile.enrollmentNumber}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">College ID</span>
                  <span className="info-value">{profile.collegeId}</span>
                </div>
              </div>
              <div className="info-grid-four">
                <div className="info-grid-item">
                  <span className="info-label">Course</span>
                  <span className="info-value">{courseDisplay}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{department || 'N/A'}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Admission Year</span>
                  <span className="info-value">{profile.admissionYear}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Grad. Year</span>
                  <span className="info-value">{profile.graduationYear}</span>
                </div>
              </div>
              <div className="info-grid-two">
                <div className="info-grid-item">
                  <span className="info-label">Current Year</span>
                  <span className="info-value">{profile.currentYear}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Current Semester</span>
                  <span className="info-value">{profile.currentSemester}</span>
                </div>
              </div>

              <h4 className="section-subheader">10th Standard</h4>
              <div className="info-grid-three">
                <div className="info-grid-item">
                  <span className="info-label">Percentage</span>
                  <span className="info-value">{Number(profile.tenthPercentage).toFixed(2)}%</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Year of Passing</span>
                  <span className="info-value">{profile.tenthYear}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Board</span>
                  <span className="info-value">{profile.tenthBoard}</span>
                </div>
              </div>

              <h4 className="section-subheader">12th Standard</h4>
              <div className="info-grid-three">
                <div className="info-grid-item">
                  <span className="info-label">Percentage</span>
                  <span className="info-value">{Number(profile.twelfthPercentage).toFixed(2)}%</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Year of Passing</span>
                  <span className="info-value">{profile.twelfthYear}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Board</span>
                  <span className="info-value">{profile.twelfthBoard}</span>
                </div>
              </div>

              {(profile.diplomaPercentage || profile.diplomaYear) && (
                <>
                  <h4 className="section-subheader">Diploma</h4>
                  <div className="info-grid-two">
                    <div className="info-grid-item">
                      <span className="info-label">Percentage</span>
                      <span className="info-value">{profile.diplomaPercentage ? `${Number(profile.diplomaPercentage).toFixed(2)}%` : '-'}</span>
                    </div>
                    <div className="info-grid-item">
                      <span className="info-label">Year of Passing</span>
                      <span className="info-value">{profile.diplomaYear || '-'}</span>
                    </div>
                  </div>
                </>
              )}

              <h4 className="section-subheader">Current Performance</h4>
              <div className="info-grid-three">
                <div className="info-grid-item">
                  <span className="info-label">CGPA</span>
                  <span className="info-value">{Number(profile.cgpa).toFixed(2)}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Active Backlogs</span>
                  <span className="info-value">{profile.activeBacklogs}</span>
                </div>
                <div className="info-grid-item">
                  <span className="info-label">Passive Backlogs</span>
                  <span className="info-value">{profile.passiveBacklogs}</span>
                </div>
              </div>
              {semesterResults.length > 0 && (
                <div className="info-row" style={{ marginTop: '8px' }}>
                  <span className="info-label">SGPA</span>
                  <span className="info-value">
                    {semesterResults.map(sr => `Sem ${sr.semester}: ${Number(sr.sgpa).toFixed(2)}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <Phone className="info-icon orange" />
                <h3>Contact Information</h3>
              </div>
              <button className="edit-icon-btn" onClick={() => openEdit('contact')}>
                <Edit size={18} />
              </button>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">College Email</span>
                <span className="info-value">{collegeEmail}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Mobile Number</span>
                <span className="info-value">{profile.phoneNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">WhatsApp Number</span>
                <span className="info-value">{profile.whatsappNumber}</span>
              </div>
              <div className={`expanded-content ${expanded.contact ? 'show' : ''}`}>
                {profile.alternatePhone && (
                  <div className="info-row">
                    <span className="info-label">Alternate Phone</span>
                    <span className="info-value">{profile.alternatePhone}</span>
                  </div>
                )}
                {profile.alternateEmail && (
                  <div className="info-row">
                    <span className="info-label">Personal Email</span>
                    <span className="info-value">{profile.alternateEmail}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="view-details-btn" onClick={() => toggleSection('contact')}>
              {expanded.contact ? 'Show Less' : 'View Details'} {expanded.contact ? <ChevronUp size={16} /> : '\u2192'}
            </button>
          </div>

          {/* Current Address & Location */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <MapPin className="info-icon" />
                <h3>Current Address & Location</h3>
              </div>
              <button className="edit-icon-btn" onClick={() => openEdit('address')}>
                <Edit size={18} />
              </button>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span className="info-label">Current Address</span>
                <span className="info-value">{profile.currentAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Permanent Address</span>
                <span className="info-value">{profile.permanentAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">City</span>
                <span className="info-value">{profile.nativeCity}</span>
              </div>
              <div className="info-row">
                <span className="info-label">District</span>
                <span className="info-value">{profile.nativeDistrict}</span>
              </div>
              <div className="info-row">
                <span className="info-label">State</span>
                <span className="info-value">{profile.nativeState}</span>
              </div>
              <div className="info-row">
                <span className="info-label">LinkedIn</span>
                <span className="info-value">{profile.linkedinUrl || 'Not Provided'}</span>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-title">
                <FileText className="info-icon purple" />
                <h3>Resume</h3>
              </div>
              <button className="edit-icon-btn" onClick={() => openEdit('resume')}>
                <Edit size={18} />
              </button>
            </div>
            <div className="resume-content">
              {resumeDoc ? (
                <>
                  <div className="resume-file">
                    <div className="pdf-icon">PDF</div>
                    <div className="resume-info">
                      <h4>Resume Uploaded</h4>
                      <p>Uploaded on {resumeUploadedOn}</p>
                      {resumeUrl && (
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                          {resumeUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="resume-actions">
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-action-btn view" style={{ textDecoration: 'none' }}>
                      <Eye size={16} />
                      View
                    </a>
                    <button className="resume-action-btn replace" onClick={() => openEdit('resume')}>
                      <RefreshCw size={16} />
                      Replace
                    </button>
                  </div>
                </>
              ) : (
                <div className="resume-file">
                  <div className="pdf-icon">PDF</div>
                  <div className="resume-info">
                    <h4>Not Provided</h4>
                    <p>No resume uploaded yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editingSection && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingSection === 'personal' && 'Edit Personal Information'}
                {editingSection === 'academic' && 'Edit Academic Information'}
                {editingSection === 'contact' && 'Edit Contact Information'}
                {editingSection === 'address' && 'Edit Address & Location'}
                {editingSection === 'resume' && 'Upload Resume'}
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

              {/* Personal Info Form */}
              {editingSection === 'personal' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Full Name</label>
                    <input type="text" value={editForm.fullName || ''} onChange={e => updateField('fullName', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Date of Birth</label>
                    <input type="date" value={editForm.dob || ''} onChange={e => updateField('dob', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Gender</label>
                    <select value={editForm.gender || ''} onChange={e => updateField('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Aadhar Number</label>
                    <input type="text" value={editForm.aadharNumber || ''} onChange={e => updateField('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="12-digit Aadhar number" />
                  </div>
                  <div className="modal-field">
                    <label>PAN Number</label>
                    <input type="text" value={editForm.panNumber || ''} onChange={e => updateField('panNumber', e.target.value.toUpperCase())} placeholder="e.g. ABCDE1234F" />
                  </div>
                </div>
              )}

              {/* Academic Info Form */}
              {editingSection === 'academic' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>University Roll No.</label>
                    <input type="text" value={editForm.btuRollNumber || ''} onChange={e => updateField('btuRollNumber', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Enrollment Number</label>
                    <input type="text" value={editForm.enrollmentNumber || ''} onChange={e => updateField('enrollmentNumber', e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>Course</label>
                    <select value={editForm.course || ''} onChange={e => { updateField('course', e.target.value); updateField('department', ''); updateField('mbaSpecialization1', ''); updateField('mbaSpecialization2', ''); }}>
                      <option value="">Select course</option>
                      {COURSE_OPTIONS.map(c => <option key={c} value={c}>{COURSE_LABELS[c]}</option>)}
                    </select>
                  </div>
                  {editForm.course === 'MBA' ? (
                    <>
                      <div className="modal-field">
                        <label>First Specialization</label>
                        <select value={editForm.mbaSpecialization1 || ''} onChange={e => updateField('mbaSpecialization1', e.target.value)}>
                          <option value="">Select specialization</option>
                          {MBA_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="modal-field">
                        <label>Second Specialization</label>
                        <select value={editForm.mbaSpecialization2 || ''} onChange={e => updateField('mbaSpecialization2', e.target.value)}>
                          <option value="">Select specialization</option>
                          {MBA_SPECIALIZATIONS.map(s => <option key={s} value={s} disabled={s === editForm.mbaSpecialization1}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="modal-field">
                      <label>Department / Branch</label>
                      <select value={editForm.department || ''} onChange={e => updateField('department', e.target.value)} disabled={!editForm.course}>
                        <option value="">{editForm.course ? 'Select department' : 'Select a course first'}</option>
                        {(DEPARTMENTS_BY_COURSE[editForm.course] || []).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="modal-field">
                    <label>Admission Year</label>
                    <select value={editForm.admissionYear || ''} onChange={e => {
                      updateField('admissionYear', e.target.value);
                      const duration = editForm.course === 'BTECH' ? 4 : 2;
                      if (e.target.value) updateField('graduationYear', String(parseInt(e.target.value) + duration));
                    }}>
                      <option value="">Select year</option>
                      {Array.from({ length: 10 }, (_, i) => `${CURRENT_YEAR - 9 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Graduation Year</label>
                    <input type="text" value={editForm.graduationYear || ''} readOnly />
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
                  <h4 className="modal-section-label">10th Standard</h4>
                  <div className="modal-field">
                    <label>Percentage</label>
                    <input type="text" value={editForm.tenthPercentage || ''} onChange={e => updateField('tenthPercentage', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 85.5" />
                  </div>
                  <div className="modal-field">
                    <label>Year of Passing</label>
                    <select value={editForm.tenthYear || ''} onChange={e => updateField('tenthYear', e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Board</label>
                    <input type="text" value={editForm.tenthBoard || ''} onChange={e => updateField('tenthBoard', e.target.value)} placeholder="e.g. RBSE, CBSE" />
                  </div>
                  <h4 className="modal-section-label">12th Standard</h4>
                  <div className="modal-field">
                    <label>Percentage</label>
                    <input type="text" value={editForm.twelfthPercentage || ''} onChange={e => updateField('twelfthPercentage', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 80.0" />
                  </div>
                  <div className="modal-field">
                    <label>Year of Passing</label>
                    <select value={editForm.twelfthYear || ''} onChange={e => updateField('twelfthYear', e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Board</label>
                    <input type="text" value={editForm.twelfthBoard || ''} onChange={e => updateField('twelfthBoard', e.target.value)} placeholder="e.g. RBSE, CBSE" />
                  </div>
                  <h4 className="modal-section-label">Diploma (if applicable)</h4>
                  <div className="modal-field">
                    <label>Percentage</label>
                    <input type="text" value={editForm.diplomaPercentage || ''} onChange={e => updateField('diplomaPercentage', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 78.0" />
                  </div>
                  <div className="modal-field">
                    <label>Year of Passing</label>
                    <select value={editForm.diplomaYear || ''} onChange={e => updateField('diplomaYear', e.target.value)}>
                      <option value="">Select year</option>
                      {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <h4 className="modal-section-label">Current Performance</h4>
                  <div className="modal-field">
                    <label>CGPA</label>
                    <input type="text" value={editForm.cgpa || ''} onChange={e => updateField('cgpa', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 8.5" />
                  </div>
                  <div className="modal-field">
                    <label>Active Backlogs</label>
                    <input type="text" value={editForm.activeBacklogs || ''} onChange={e => updateField('activeBacklogs', e.target.value.replace(/\D/g, ''))} placeholder="0" />
                  </div>
                  <div className="modal-field">
                    <label>Passive Backlogs</label>
                    <input type="text" value={editForm.passiveBacklogs || ''} onChange={e => updateField('passiveBacklogs', e.target.value.replace(/\D/g, ''))} placeholder="0" />
                  </div>
                </div>
              )}

              {/* Contact Info Form */}
              {editingSection === 'contact' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Mobile Number</label>
                    <input type="tel" value={editForm.phoneNumber || ''} onChange={e => updateField('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" />
                  </div>
                  <div className="modal-field">
                    <label>WhatsApp Number</label>
                    <input type="tel" value={editForm.whatsappNumber || ''} onChange={e => updateField('whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="WhatsApp number" />
                  </div>
                  <div className="modal-field">
                    <label>Alternate Phone</label>
                    <input type="tel" value={editForm.alternatePhone || ''} onChange={e => updateField('alternatePhone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Alternate phone (optional)" />
                  </div>
                  <div className="modal-field">
                    <label>Personal Email</label>
                    <input type="email" value={editForm.alternateEmail || ''} onChange={e => updateField('alternateEmail', e.target.value)} placeholder="your@email.com" />
                  </div>
                </div>
              )}

              {/* Address Form */}
              {editingSection === 'address' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Current Address</label>
                    <textarea value={editForm.currentAddress || ''} onChange={e => updateField('currentAddress', e.target.value)} rows={3} placeholder="Enter current address" />
                  </div>
                  <div className="modal-field">
                    <label>Permanent Address</label>
                    <textarea value={editForm.permanentAddress || ''} onChange={e => updateField('permanentAddress', e.target.value)} rows={3} placeholder="Enter permanent address" />
                  </div>
                  <div className="modal-field">
                    <label>City</label>
                    <input type="text" value={editForm.nativeCity || ''} onChange={e => updateField('nativeCity', e.target.value)} placeholder="Enter city" />
                  </div>
                  <div className="modal-field">
                    <label>District</label>
                    <input type="text" value={editForm.nativeDistrict || ''} onChange={e => updateField('nativeDistrict', e.target.value)} placeholder="Enter district" />
                  </div>
                  <div className="modal-field">
                    <label>State</label>
                    <select value={editForm.nativeState || ''} onChange={e => updateField('nativeState', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>LinkedIn URL</label>
                    <input type="url" value={editForm.linkedinUrl || ''} onChange={e => updateField('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              )}

              {/* Resume Upload Form */}
              {editingSection === 'resume' && (
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Resume Link</label>
                    <input
                      type="url"
                      value={editForm.resumeUrl || ''}
                      onChange={e => updateField('resumeUrl', e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <span className="modal-field-hint">Paste your Google Drive or cloud storage link</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={closeEdit} disabled={saving}>
                Cancel
              </button>
              <button className="modal-save-btn" onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
