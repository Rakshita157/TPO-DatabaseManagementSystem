import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, ChevronDown, ChevronUp,
  Trash2, Eye, X, LogOut, ArrowUpDown, Users, Home, Edit, Loader2,
  Save, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import {
  getStudents, deleteStudent, exportStudents, getFilterOptions, updatePlacementStatus
} from '../../services/admin.service';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Dashboard.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };
const COURSE_SEMESTERS = { BTECH: 8, MTECH: 4, MBA: 4, MCA: 4 };

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const getSemesterOptions = (course) => {
  const count = COURSE_SEMESTERS[course] || 8;
  return Array.from({ length: count }, (_, i) => i + 1);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [unplacedCount, setUnplacedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    departments: [], courses: [], years: [], admissionYears: [], graduationYears: [], genders: [],
  });
  const [filters, setFilters] = useState({
    department: '', course: '', currentYear: '', currentSemester: '',
    admissionYear: '', graduationYear: '', gender: '',
    cgpaMin: '', cgpaMax: '', resumeUploaded: '', linkedinAdded: '', placementEligible: '',
  });
  const [pendingChanges, setPendingChanges] = useState({});
  const [toasts, setToasts] = useState([]);
  const [confirmDiscard, setConfirmDiscard] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit, sortBy, sortOrder,
      };

      if (searchField) params.search = searchField;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const [studentsRes, filtersRes, placedRes, unplacedRes] = await Promise.all([
        getStudents(params),
        getFilterOptions(),
        getStudents({ ...params, placementStatus: 'PLACED', page: 1, limit: 1 }),
        getStudents({ ...params, placementStatus: 'NOT_PLACED', page: 1, limit: 1 }),
      ]);
      setStudents(studentsRes.data.students);
      setTotal(studentsRes.data.total);
      setTotalPages(studentsRes.data.totalPages);
      setPlacedCount(placedRes.data.total);
      setUnplacedCount(unplacedRes.data.total);
      setFilterOptions(prev => ({ ...prev, ...filtersRes.data }));
      setHasResults(true);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [page, limit, sortBy, sortOrder, searchField, filters]);

  useEffect(() => { if (hasSearched) fetchData(); }, [fetchData, hasSearched]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await getFilterOptions();
        setFilterOptions(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchField(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'cgpa' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'course' && value) {
        const maxSem = COURSE_SEMESTERS[value] || 8;
        if (next.currentSemester && Number(next.currentSemester) > maxSem) {
          next.currentSemester = '';
        }
      }
      return next;
    });
    setPage(1);
    setSelectedIds([]);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || searchQuery;
  const canSearch = filters.course && filters.graduationYear;
  const hasUnsavedPlacement = Object.keys(pendingChanges).length > 0;

  const handleSearch = () => {
    if (!canSearch) return;
    if (hasUnsavedPlacement) {
      setConfirmDiscard(() => handleSearchInner);
      return;
    }
    handleSearchInner();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.userId));
    }
  };

  const toggleSelect = (userId) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDelete = async (userId) => {
    try {
      await deleteStudent(userId);
      setConfirmDelete(null);
      fetchData();
    } catch {
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      if (searchField) params.search = searchField;
      const res = await exportStudents(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handlePlacementToggle = (userId) => {
    const student = students.find(s => s.userId === userId);
    if (!student) return;
    const originalStatus = student.placementStatus;
    const currentDisplay = pendingChanges[userId] ?? originalStatus;
    const newStatus = currentDisplay === 'PLACED' ? 'NOT_PLACED' : 'PLACED';
    setPendingChanges(prev => {
      if (newStatus === originalStatus) {
        const { [userId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [userId]: newStatus };
    });
  };

  const handleSavePlacement = async (userId) => {
    const newStatus = pendingChanges[userId];
    if (!newStatus) return;
    try {
      await updatePlacementStatus(userId, newStatus);
      setStudents(prev =>
        prev.map(s => s.userId === userId ? { ...s, placementStatus: newStatus } : s)
      );
      if (newStatus === 'PLACED') {
        setPlacedCount(p => p + 1);
        setUnplacedCount(u => u - 1);
      } else {
        setPlacedCount(p => p - 1);
        setUnplacedCount(u => u + 1);
      }
      setPendingChanges(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
      addToast('Placement status updated successfully', 'success');
    } catch {
      setPendingChanges(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
      addToast('Failed to update placement status', 'error');
    }
  };

  const clearFiltersInner = () => {
    setFilters({
      department: '', course: '', currentYear: '', currentSemester: '',
      admissionYear: '', graduationYear: '', gender: '',
      cgpaMin: '', cgpaMax: '', resumeUploaded: '', linkedinAdded: '', placementEligible: '',
    });
    setSearchQuery('');
    setSearchField('');
    setPage(1);
    setSelectedIds([]);
    setSortBy('fullName');
    setSortOrder('asc');
    setHasSearched(false);
    setHasResults(false);
    setSearching(false);
  };

  const handleSearchInner = () => {
    if (!canSearch) return;
    setSearching(true);
    setSearchField(searchQuery);
    setPage(1);
    setHasSearched(true);
  };

  const handleDiscardConfirm = () => {
    const action = confirmDiscard;
    setPendingChanges({});
    setConfirmDiscard(null);
    if (action) action();
  };

  const clearFilters = () => {
    if (hasUnsavedPlacement) {
      setConfirmDiscard(() => clearFiltersInner);
      return;
    }
    clearFiltersInner();
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src={tpoLogo} alt="T&P Cell Logo" className="admin-sidebar-logo-img" />
          <div className="admin-sidebar-logo-text">
            <div className="admin-sidebar-title">Training and<br />Placement Cell</div>
            <div className="admin-sidebar-subtitle">GWEC, Ajmer</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item active">
            <Users size={18} />
            Students
          </button>
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <Home size={18} />
            Landing Page
          </button>
          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <img src={tpoLogo} alt="T&P Cell Logo" className="admin-sidebar-footer-logo" />
          <div className="admin-sidebar-footer-text">
            <div className="admin-sidebar-title">Training and<br />Placement Cell</div>
            <div className="admin-sidebar-subtitle">GWEC, Ajmer</div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
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
            <h2>Students</h2>
            <p>Manage and track student records</p>
          </div>
          <div className="section-header-right">
            <button className="reset-filters-btn" onClick={clearFilters}>
              <X size={16} /> Reset Filters
            </button>
            <button className="export-btn" onClick={handleExport}>
              <Download size={18} />
              Download Excel
            </button>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Name, College ID, BTU Roll No. or Email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <select className="filter-select" value={filters.admissionYear} onChange={(e) => handleFilterChange('admissionYear', e.target.value)}>
            <option value="">Admission Year</option>
            {(filterOptions.admissionYears || []).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="filter-select required" value={filters.course} onChange={(e) => handleFilterChange('course', e.target.value)}>
            <option value="">Course *</option>
            {(filterOptions.courses || []).map(c => <option key={c} value={c}>{COURSE_LABELS[c] || c}</option>)}
          </select>
          <select className="filter-select required" value={filters.graduationYear} onChange={(e) => handleFilterChange('graduationYear', e.target.value)}>
            <option value="">Graduation Year *</option>
            {(filterOptions.graduationYears || []).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="filter-select" value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}>
            <option value="">Department</option>
            {(filterOptions.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            More Filters {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(v => v).length + (searchQuery ? 1 : 0)}</span>}
          </button>
          <button className="search-btn" onClick={handleSearch} disabled={!canSearch || searching}>
            {searching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showFilters && (
          <div className="advanced-filters more-filters-panel">
            <div className="filters-panel-header">
              <div>
                <h3>More Filters</h3>
                <p>Refine results with additional student filters.</p>
              </div>
              <button className="reset-filters-btn" onClick={clearFilters}>
                <X size={16} /> Reset Filters
              </button>
            </div>
            <div className="filters-grid">
              <div className="filter-field">
                <label>Gender</label>
                <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)}>
                  <option value="">All</option>
                  {(filterOptions.genders || []).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>Current Year</label>
                <select value={filters.currentYear} onChange={(e) => handleFilterChange('currentYear', e.target.value)}>
                  <option value="">All</option>
                  {(filterOptions.years || []).map(y => <option key={y} value={y}>{y}{y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>Current Semester</label>
                <select value={filters.currentSemester} onChange={(e) => handleFilterChange('currentSemester', e.target.value)}>
                  <option value="">All</option>
                  {getSemesterOptions(filters.course).map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label>Admission Year</label>
                <select value={filters.admissionYear} onChange={(e) => handleFilterChange('admissionYear', e.target.value)}>
                  <option value="">All</option>
                  {(filterOptions.admissionYears || []).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>CGPA Range</label>
                <div className="range-inputs">
                  <input type="number" min="0" max="10" step="0.1" placeholder="Min" value={filters.cgpaMin} onChange={(e) => handleFilterChange('cgpaMin', e.target.value)} />
                  <span>-</span>
                  <input type="number" min="0" max="10" step="0.1" placeholder="Max" value={filters.cgpaMax} onChange={(e) => handleFilterChange('cgpaMax', e.target.value)} />
                </div>
              </div>
              <div className="filter-field">
                <label>Resume Uploaded</label>
                <select value={filters.resumeUploaded} onChange={(e) => handleFilterChange('resumeUploaded', e.target.value)}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="filter-field">
                <label>LinkedIn Added</label>
                <select value={filters.linkedinAdded} onChange={(e) => handleFilterChange('linkedinAdded', e.target.value)}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="filter-field">
                <label>Placement Eligible</label>
                <select value={filters.placementEligible} onChange={(e) => handleFilterChange('placementEligible', e.target.value)}>
                  <option value="">All</option>
                  <option value="yes">Eligible (0 backlogs)</option>
                  <option value="no">Not Eligible (active backlogs)</option>
                </select>
              </div>
              <div className="filter-field placeholder-filter">
                <label>Company</label>
                <input type="text" placeholder="Coming soon" disabled />
              </div>
            </div>
          </div>
        )}

      {hasResults && (
      <section className="students-section">
        {students.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} strokeWidth={1.5} />
            </div>
            <h3>No students found</h3>
            <p>No students match your search criteria. Try changing your search or filters.</p>
            <button className="reset-filters-btn" onClick={clearFilters}>
              <X size={16} /> Reset Filters
            </button>
          </div>
        ) : (
          <>
        <div className="stats-strip">
          <div className="stats-strip-item">
            <span className="stats-strip-label">Total Students</span>
            <strong className="stats-strip-value">{total}</strong>
          </div>
          <div className="stats-strip-divider"></div>
          <div className="stats-strip-item">
            <span className="stats-strip-label">Placed</span>
            <strong className="stats-strip-value stats-value-placed">{placedCount}</strong>
          </div>
          <div className="stats-strip-divider"></div>
          <div className="stats-strip-item">
            <span className="stats-strip-label">Not Placed</span>
            <strong className="stats-strip-value stats-value-unplaced">{unplacedCount}</strong>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedIds.length} student(s) selected</span>
            <button className="bulk-delete-btn" onClick={async () => {
              for (const id of selectedIds) {
                try { await deleteStudent(id); } catch {}
              }
              setSelectedIds([]);
              fetchData();
            }}>
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        )}

        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="table-checkbox" checked={selectedIds.length === students.length && students.length > 0} onChange={toggleSelectAll} /></th>
                <th className="sortable" onClick={() => handleSort('fullName')}>Name <SortIcon field="fullName" /></th>
                <th>Roll No</th>
                <th>Enrollment No</th>
                <th>College ID</th>
                <th>Email</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>WhatsApp</th>
                <th>Alt Phone</th>
                <th>Alt Email</th>
                <th>Course</th>
                <th className="sortable" onClick={() => handleSort('department')}>Department <SortIcon field="department" /></th>
                <th>Batch</th>
                <th>Year/Sem</th>
                <th className="sortable" onClick={() => handleSort('cgpa')}>CGPA <SortIcon field="cgpa" /></th>
                <th>SGPA</th>
                <th>Resume</th>
                <th className="sortable" onClick={() => handleSort('activeBacklogs')}>Active Backlogs <SortIcon field="activeBacklogs" /></th>
                <th>Passive Backlogs</th>
                <th>LinkedIn</th>
                <th>Current Address</th>
                <th>Permanent Address</th>
                <th>City</th>
                <th>District</th>
                <th>State</th>
                <th>Aadhar No</th>
                <th>PAN No</th>
                <th>10th Board</th>
                <th>10th %</th>
                <th>10th Year</th>
                <th>12th Board</th>
                <th>12th %</th>
                <th>12th Year</th>
                <th>Diploma %</th>
                <th>Diploma Year</th>
                <th>Verified</th>
                <th>Profile Status</th>
                <th>Placement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="42" className="table-empty">Loading...</td></tr>
              ) : students.map((s) => {
                const displayStatus = pendingChanges[s.userId] ?? s.placementStatus;
                const isDirty = pendingChanges[s.userId] !== undefined;
                return (
                <tr key={s.userId} className={isDirty ? 'has-unsaved' : ''}>
                  <td><input type="checkbox" className="table-checkbox" checked={selectedIds.includes(s.userId)} onChange={() => toggleSelect(s.userId)} /></td>
                  <td className="student-name">{s.user?.fullName}</td>
                  <td className="roll-no">{s.btuRollNumber}</td>
                  <td>{s.enrollmentNumber}</td>
                  <td>{s.collegeId}</td>
                  <td className="student-email">{s.user?.collegeEmail}</td>
                  <td>{formatDate(s.dob)}</td>
                  <td>{s.gender}</td>
                  <td>{s.phoneNumber}</td>
                  <td>{s.whatsappNumber}</td>
                  <td>{s.alternatePhone || '-'}</td>
                  <td>{s.alternateEmail || '-'}</td>
                  <td>{COURSE_LABELS[s.course]}</td>
                  <td className="dept-cell" title={s.department || 'N/A'}>{s.department || 'N/A'}</td>
                  <td>{s.admissionYear}-{s.graduationYear}</td>
                  <td>{s.currentYear}Y / S{s.currentSemester}</td>
                  <td className="cgpa">{Number(s.cgpa).toFixed(2)}</td>
                  <td>
                    {s.semesterResults?.length > 0
                      ? s.semesterResults[s.semesterResults.length - 1].sgpa
                        ? Number(s.semesterResults[s.semesterResults.length - 1].sgpa).toFixed(2)
                        : '-'
                      : '-'}
                  </td>
                  <td>
                    {s.document
                      ? <span className="status-badge badge-uploaded"><FileText size={13} /> Uploaded</span>
                      : <span className="status-badge badge-none"><FileText size={13} /> None</span>}
                  </td>
                  <td className="cgpa">{s.activeBacklogs ?? 0}</td>
                  <td className="cgpa">{s.passiveBacklogs ?? 0}</td>
                  <td>{s.linkedinUrl ? <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{color:'#1e3a8a',fontSize:'0.8rem'}}>Link</a> : '-'}</td>
                  <td>{s.currentAddress || '-'}</td>
                  <td>{s.permanentAddress || '-'}</td>
                  <td>{s.nativeCity || '-'}</td>
                  <td>{s.nativeDistrict || '-'}</td>
                  <td>{s.nativeState || '-'}</td>
                  <td>{s.aadharNumber || '-'}</td>
                  <td>{s.panNumber || '-'}</td>
                  <td>{s.tenthBoard || '-'}</td>
                  <td>{s.tenthPercentage != null ? Number(s.tenthPercentage).toFixed(2) : '-'}</td>
                  <td>{s.tenthYear || '-'}</td>
                  <td>{s.twelfthBoard || '-'}</td>
                  <td>{s.twelfthPercentage != null ? Number(s.twelfthPercentage).toFixed(2) : '-'}</td>
                  <td>{s.twelfthYear || '-'}</td>
                  <td>{s.diplomaPercentage != null ? Number(s.diplomaPercentage).toFixed(2) : '-'}</td>
                  <td>{s.diplomaYear || '-'}</td>
                  <td>{s.isVerified ? 'Yes' : 'No'}</td>
                  <td>{s.profileStatus === 'COMPLETE' ? 'Complete' : 'Incomplete'}</td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={displayStatus === 'PLACED'}
                        onChange={() => handlePlacementToggle(s.userId)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-label ${displayStatus === 'PLACED' ? 'placed' : ''}`}>
                      {displayStatus === 'PLACED' ? 'Placed' : 'Unplaced'}
                    </span>
                    {isDirty && <span className="unsaved-badge">Unsaved</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {isDirty && (
                        <button className="action-btn save" title="Save placement change" onClick={() => handleSavePlacement(s.userId)}>
                          <Save size={16} />
                        </button>
                      )}
                      <button className="action-btn view" title="View Profile" onClick={() => navigate(`/admin/student/${s.userId}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="action-btn edit" title="Edit Student" onClick={() => navigate(`/admin/student/${s.userId}`)}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="table-info">
            Showing <strong>{students.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> students
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button key={pageNum} className={`pagination-btn ${page === pageNum ? 'active' : ''}`} onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </button>
                );
              })}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
          </>
        )}
      </section>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="confirm-delete" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmDiscard && (
        <div className="modal-overlay" onClick={() => setConfirmDiscard(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Unsaved Changes</h3>
            <p>You have unsaved placement changes. Discard them and proceed?</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDiscard(null)}>Cancel</button>
              <button className="confirm-delete" onClick={handleDiscardConfirm}>Discard</button>
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
      </main>
    </div>
  );
}
