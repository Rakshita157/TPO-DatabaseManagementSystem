import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getMe } from '../services/auth.service';
import { getStudentProfile } from '../services/student.service';
import './Navbar.css';
import collegeLogo from '../assets/logos/govt.mahila_engineering-removebg-preview.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNoProfileModal, setShowNoProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(storedUser.role === 'ADMIN');
    getMe()
      .then(() => setIsLoggedIn(true))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      });
  }, []);

  const handleMyProfileClick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      window.location.href = '/auth';
      return;
    }

    try {
      await getStudentProfile(storedUser.id);
      window.location.href = '/student/profile';
    } catch {
      setShowNoProfileModal(true);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={collegeLogo} alt="GWECA Logo" className="navbar-logo" />
          <div className="navbar-college-info">
            <h1 className="navbar-college-name">GWECA</h1>
            <p className="navbar-subtitle">Training & Placement Office</p>
          </div>
        </div>

        <ul className="navbar-links">
          <li><a href="/" className="navbar-link active">Home</a></li>
          <li><a href="#about" className="navbar-link">About TPO</a></li>
          <li><a href="#contact" className="navbar-link">Contact</a></li>
          {isAdmin ? (
            <li><a href="/admin/dashboard" className="navbar-link">Admin Dashboard</a></li>
          ) : (
            <li><a href="/student/profile" className="navbar-link" onClick={handleMyProfileClick}>My Profile</a></li>
          )}
        </ul>

        {!isLoggedIn && (
          <div className="navbar-actions">
            <button className="navbar-btn navbar-btn-secondary" onClick={() => window.location.href = '/auth'}>
              Student Login
            </button>
            <button className="navbar-btn navbar-btn-primary" onClick={() => window.location.href = '/auth'}>
              Admin Login
            </button>
          </div>
        )}

        <button className="navbar-mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
        <ul className="navbar-links">
          <li><a href="/" className="navbar-link active">Home</a></li>
          <li><a href="#about" className="navbar-link">About TPO</a></li>
          <li><a href="#contact" className="navbar-link">Contact</a></li>
          {isAdmin ? (
            <li><a href="/admin/dashboard" className="navbar-link">Admin Dashboard</a></li>
          ) : (
            <li><a href="/student/profile" className="navbar-link" onClick={handleMyProfileClick}>My Profile</a></li>
          )}
        </ul>
        {!isLoggedIn && (
          <div className="navbar-actions">
            <button className="navbar-btn navbar-btn-secondary" onClick={() => window.location.href = '/auth'}>
              Student Login
            </button>
            <button className="navbar-btn navbar-btn-primary" onClick={() => window.location.href = '/auth'}>
              Admin Login
            </button>
          </div>
        )}
      </div>

      {showNoProfileModal && (
        <div className="no-profile-modal-overlay" onClick={() => setShowNoProfileModal(false)}>
          <div className="no-profile-modal" onClick={e => e.stopPropagation()}>
            <button className="no-profile-modal-close" onClick={() => setShowNoProfileModal(false)}>
              <X size={20} />
            </button>
            <div className="no-profile-modal-body">
              <p>No profile found. Please complete your registration.</p>
              <button
                className="no-profile-modal-btn"
                onClick={() => {
                  setShowNoProfileModal(false);
                  window.location.href = '/student-registration';
                }}
              >
                Complete Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
