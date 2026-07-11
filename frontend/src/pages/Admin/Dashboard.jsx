import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, ChevronDown, ChevronUp,
  Edit, Trash2, Eye, Users, GraduationCap, TrendingUp,
  CheckCircle, X, LogOut, ArrowUpDown
} from 'lucide-react';
import {
  getDashboardStats, getStudents, deleteStudent, exportStudents, getFilterOptions
} from '../../services/admin.service';
import './Dashboard.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [stats, setStats] = useState({ totalStudents: 0, placedStudents: 0, verifiedStudents: 0, placementRate: '0' });
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    departments: [], courses: [], years: [], semesters: [], admissionYears: [], genders: [],
  });
  const [filters, setFilters] = useState({
    department: '', course: '', currentYear: '', currentSemester: '',
    admissionYear: '', graduationYear: '', gender: '',
    cgpaMin: '', cgpaMax: '', resumeUploaded: '', linkedinAdded: '', placementEligible: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit, sortBy, sortOrder,
      };

      if (searchField) params.search = searchField;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const [statsRes, studentsRes, filtersRes] = await Promise.all([
        getDashboardStats(),
        getStudents(params),
        getFilterOptions(),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data.students);
      setTotal(studentsRes.data.total);
      setTotalPages(studentsRes.data.totalPages);
      setFilterOptions(filtersRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, searchField, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchField(searchQuery);
      setPage(1);
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
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setSelectedIds([]);
  };

  const clearFilters = () => {
    setFilters({
      department: '', course: '', currentYear: '', currentSemester: '',
      admissionYear: '', graduationYear: '', gender: '',
      cgpaMin: '', cgpaMax: '', resumeUploaded: '', linkedinAdded: '', placementEligible: '',
    });
    setSearchQuery('');
    setSearchField('');
    setPage(1);
    setSelectedIds([]);
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || searchQuery;

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
      link.setAttribute('download', 'students_export.csv');
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

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <div className="admin-logo-icon">&#x1F393;</div>
            <div className="admin-logo-text">
              <h1>Admin Dashboard</h1>
              <p>Training & Placement Office</p>
            </div>
          </div>
        </div>
        <div className="admin-header-right">
          <button className="header-icon-btn export-header-btn" onClick={handleExport} title="Export CSV">
            <Download size={20} />
          </button>
          <button className="header-icon-btn logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
          <div className="admin-user-badge">
            <span className="admin-user-name">{storedUser.fullName || 'Admin'}</span>
          </div>
        </div>
      </header>

      <section className="admin-stats">
        {[
          { title: 'Total Students', value: stats.totalStudents, subtitle: 'Registered students', icon: Users, color: 'blue' },
          { title: 'Verified Students', value: stats.verifiedStudents, subtitle: 'Profile verified', icon: CheckCircle, color: 'green' },
          { title: 'Placed Students', value: stats.placedStudents, subtitle: `${stats.placementRate}% placement rate`, icon: TrendingUp, color: 'purple' },
          { title: 'Active Profiles', value: stats.totalProfiles, subtitle: 'Completed profiles', icon: GraduationCap, color: 'orange' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`admin-stat-card ${stat.color}`}>
              <div className="stat-card-icon"><Icon size={24} /></div>
              <div className="stat-card-content">
                <h3>{stat.title}</h3>
                <div className="stat-card-value">{stat.value}</div>
                <p>{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="students-section">
        <div className="section-header">
          <div className="section-header-left">
            <h2>Students</h2>
            <p>Manage and track student records</p>
          </div>
          <div className="section-header-right">
            <button className="export-btn" onClick={handleExport}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, roll no, college ID, enrollment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select className="filter-select" value={filters.course} onChange={(e) => handleFilterChange('course', e.target.value)}>
              <option value="">All Courses</option>
              {filterOptions.courses.map(c => <option key={c} value={c}>{COURSE_LABELS[c]}</option>)}
            </select>
            <select className="filter-select" value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}>
              <option value="">All Departments</option>
              {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              Filters {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(v => v).length}</span>}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filters-grid">
              <div className="filter-field">
                <label>Gender</label>
                <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)}>
                  <option value="">All</option>
                  {filterOptions.genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>Current Year</label>
                <select value={filters.currentYear} onChange={(e) => handleFilterChange('currentYear', e.target.value)}>
                  <option value="">All</option>
                  {filterOptions.years.map(y => <option key={y} value={y}>{y}{y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>Current Semester</label>
                <select value={filters.currentSemester} onChange={(e) => handleFilterChange('currentSemester', e.target.value)}>
                  <option value="">All</option>
                  {filterOptions.semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label>Admission Year</label>
                <select value={filters.admissionYear} onChange={(e) => handleFilterChange('admissionYear', e.target.value)}>
                  <option value="">All</option>
                  {filterOptions.admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
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
            </div>
            {hasActiveFilters && (
              <div className="filters-actions">
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <X size={16} /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

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
                <th className="sortable" onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th>Roll No</th>
                <th>College ID</th>
                <th>Email</th>
                <th>Course</th>
                <th>Department</th>
                <th>Year/Sem</th>
                <th className="sortable" onClick={() => handleSort('cgpa')}>CGPA <SortIcon field="cgpa" /></th>
                <th>Resume</th>
                <th>LinkedIn</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="13" className="table-empty">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="13" className="table-empty">No students found</td></tr>
              ) : students.map((s) => (
                <tr key={s.userId}>
                  <td><input type="checkbox" className="table-checkbox" checked={selectedIds.includes(s.userId)} onChange={() => toggleSelect(s.userId)} /></td>
                  <td className="student-name">{s.user?.fullName}</td>
                  <td className="roll-no">{s.btuRollNumber}</td>
                  <td>{s.collegeId}</td>
                  <td className="student-email">{s.user?.collegeEmail}</td>
                  <td>{COURSE_LABELS[s.course]}</td>
                  <td>{s.department || 'N/A'}</td>
                  <td>{s.currentYear}Y / S{s.currentSemester}</td>
                  <td className="cgpa">{Number(s.cgpa).toFixed(2)}</td>
                  <td>{s.document ? <span className="status-badge placed">Yes</span> : <span className="status-badge not-placed">No</span>}</td>
                  <td>{s.linkedinUrl ? <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-link">View</a> : <span className="status-badge not-placed">No</span>}</td>
                  <td>
                    <span className={`status-badge ${s.placementStatus === 'PLACED' ? 'placed' : 'not-placed'}`}>
                      {s.placementStatus === 'PLACED' ? 'Placed' : 'Not Placed'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Profile" onClick={() => navigate(`/admin/student/${s.userId}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="action-btn delete" title="Delete" onClick={() => setConfirmDelete(s.userId)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
      </section>

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
    </div>
  );
}
