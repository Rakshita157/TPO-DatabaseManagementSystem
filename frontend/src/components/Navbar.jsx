import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';
import collegeLogo from '../assets/logos/govt.mahila_engineering-removebg-preview.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <li><a href="/student-registration" className="navbar-link">Register</a></li>
        </ul>

        <div className="navbar-actions">
          <button className="navbar-btn navbar-btn-secondary" onClick={() => window.location.href = '/auth'}>
            Student Login
          </button>
          <button className="navbar-btn navbar-btn-primary" onClick={() => window.location.href = '/auth'}>
            Admin Login
          </button>
        </div>

        <button className="navbar-mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
        <ul className="navbar-links">
          <li><a href="/" className="navbar-link active">Home</a></li>
          <li><a href="#about" className="navbar-link">About TPO</a></li>
          <li><a href="#contact" className="navbar-link">Contact</a></li>
          <li><a href="/student-registration" className="navbar-link">Register</a></li>
        </ul>
        <div className="navbar-actions">
          <button className="navbar-btn navbar-btn-secondary" onClick={() => window.location.href = '/auth'}>
            Student Login
          </button>
          <button className="navbar-btn navbar-btn-primary" onClick={() => window.location.href = '/auth'}>
            Admin Login
          </button>
        </div>
      </div>
    </nav>
  );
}
