import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Home, LogOut, Settings, GraduationCap,
  Plus, Trash2, X, Loader2, CheckCircle, AlertCircle,
  PanelLeftClose, PanelLeftOpen, UserCircle, Search
} from 'lucide-react';
import {
  getCollegeSettings, getAvailableStudents,
  addStudentCoordinator, deleteStudentCoordinator
} from '../../services/admin.service';
import tpoLogo from '../../assets/logos/TPO_Cell__LOGO.png';
import './Dashboard.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };
const PAGE_SIZE = 10;

function courseAndBranch(profile) {
  if (!profile) return '-';
  const course = profile.course ? (COURSE_LABELS[profile.course] || profile.course) : '-';
  return profile.department ? `${course} - ${profile.department}` : course;
}

export default function StudentCoordinators() {
  const navigate = useNavigate();
  const location = useLocation();

  const [coordinators, setCoordinators] = useState([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(true);

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [addingUserId, setAddingUserId] = useState(null);
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

  const fetchCoordinators = async () => {
    try {
      setLoadingCoordinators(true);
      const res = await getCollegeSettings();
      setCoordinators(res.data.studentCoordinators || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load coordinators', 'error');
    } finally {
      setLoadingCoordinators(false);
    }
  };

  const fetchAvailableStudents = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const res = await getAvailableStudents({ search: searchTerm, page, limit: PAGE_SIZE });
      setStudents(res.data.students || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      addToast('Failed to load available students', 'error');
    } finally {
      setLoadingAvailable(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchCoordinators();
    fetchAvailableStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAvailableStudents, searchTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
    setSearchTrigger(t => t + 1);
  };

  const handleAdd = async (student) => {
    if (addingUserId) return;
    setAddingUserId(student.id);
    try {
      await addStudentCoordinator(student.id);
      addToast(`${student.fullName || 'Student'} added as coordinator`);
      setStudents(prev => prev.filter(s => s.id !== student.id));
      setTotal(prev => Math.max(0, prev - 1));
      fetchCoordinators();
      if (students.length === 1 && page > 1) setPage(p => p - 1);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to add coordinator', 'error');
      fetchAvailableStudents();
    } finally {
      setAddingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteStudentCoordinator(confirmDelete.userId);
      setConfirmDelete(null);
      addToast('Student Coordinator removed successfully');
      fetchCoordinators();
      fetchAvailableStudents();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to remove coordinator', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pageNumbers.push(i);
  }

  const renderPagination = () => (
    <div className="pagination">
      <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)} title="Previous page">
        Prev
      </button>
      {pageNumbers.map((p, idx, arr) => (
        <span key={p} style={{ display: 'contents' }}>
          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-dots">…</span>}
          <button
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        </span>
      ))}
      <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} title="Next page">
        Next
      </button>
    </div>
  );

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
                <div className="settings-popup-item" onClick={() => { navigate('/admin/admin-details', { state: { from: location.pathname } }); setShowSettingsPopup(false); }}>
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
            <h2>Student Coordinators</h2>
            <p>Assign student coordinators from the existing student database</p>
          </div>
        </div>

        <div className="section-block">
          <h3 className="section-block-title">Assigned Coordinators</h3>
          {loadingCoordinators ? (
            <div className="loading-state">
              <Loader2 size={32} className="spin" />
              <p>Loading coordinators...</p>
            </div>
          ) : coordinators.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
              <h3>No Student Coordinators</h3>
              <p>No student coordinators have been assigned yet. Use the available students list below to assign one.</p>
            </div>
          ) : (
            <div className="faculty-table-wrap">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Course / Branch</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coordinators.map((sc, index) => {
                    const user = sc.user || {};
                    return (
                      <tr key={sc.userId}>
                        <td>{index + 1}</td>
                        <td className="faculty-name">{user.fullName || 'Unknown'}</td>
                        <td>{user.collegeEmail || '-'}</td>
                        <td>{courseAndBranch(user.studentProfile)}</td>
                        <td>
                          <button className="action-btn delete" title="Remove Coordinator" onClick={() => setConfirmDelete(sc)}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section-block">
          <div className="section-header">
            <div className="section-header-left">
              <h3 className="section-block-title">Available Students</h3>
            </div>
          </div>

          <form className="search-filter-bar" onSubmit={handleSearch}>
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">
              <Search size={16} />
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="filter-btn"
                onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1); setSearchTrigger(t => t + 1); }}
              >
                Clear
              </button>
            )}
          </form>

          {loadingAvailable ? (
            <div className="loading-state">
              <Loader2 size={32} className="spin" />
              <p>Loading available students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
              <h3>{searchTerm ? 'No Students Found' : 'All Students Assigned'}</h3>
              <p>
                {searchTerm
                  ? 'No unassigned students match your search.'
                  : 'Every student has already been assigned as a coordinator.'}
              </p>
            </div>
          ) : (
            <>
              <div className="faculty-table-wrap">
                <table className="faculty-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course / Branch</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr key={s.id}>
                        <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="faculty-name">{s.fullName || 'Unknown'}</td>
                        <td>{s.collegeEmail || '-'}</td>
                        <td>{courseAndBranch(s.studentProfile)}</td>
                        <td>
                          <button
                            className="action-btn save"
                            title="Add as Coordinator"
                            disabled={addingUserId === s.id}
                            onClick={() => handleAdd(s)}
                          >
                            {addingUserId === s.id ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <div className="table-info">
                  Showing <strong>{students.length}</strong> of <strong>{total}</strong> unassigned students
                </div>
                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </main>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Remove Student Coordinator</h3>
            <p>Are you sure you want to remove <strong>{confirmDelete.user?.fullName || 'this student'}</strong> as a student coordinator? They can be re-assigned later.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="confirm-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><Loader2 size={14} className="spin" /> Removing...</> : 'Remove'}
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