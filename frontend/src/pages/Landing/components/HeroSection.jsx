import { Mail, Phone } from 'lucide-react';
import './HeroSection.css';

export default function HeroSection({ settings, loading, getImageUrl, collegeImage }) {
  return (
    <header className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-tag">WELCOME TO</div>
          <h1 className="hero-title">Training &<br />Placement Office</h1>
          <p className="hero-description">
            We bridge the gap between talent and opportunity.<br />
            Our mission is to empower students with skills, guidance and<br />
            industry connections to build successful careers.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => window.location.href = '/auth'}>
              Student Login →
            </button>
          </div>
          <p className="hero-subtext">
            New user? <a href="/auth">Login to create your profile</a>
          </p>
        </div>

        <div className="tpo-card">
          {loading ? (
            <div className="tpo-skeleton" aria-label="Loading TPO information">
              <div className="tpo-skeleton-photo" />
              <div className="tpo-skeleton-badge" />
              <div className="tpo-skeleton-name" />
              <div className="tpo-skeleton-line" />
              <div className="tpo-skeleton-contact">
                <div className="tpo-skeleton-line short" />
                <div className="tpo-skeleton-line short" />
              </div>
            </div>
          ) : (
            <>
              <img
                className="tpo-photo"
                src={getImageUrl(settings?.tpoHeadPhoto) || collegeImage}
                alt={settings?.tpoHeadName || 'TPO Head'}
                onError={(e) => { console.error('TPO image failed to load:', e.target.src); e.target.src = collegeImage; }}
              />
              <div className="tpo-info">
                <div className="tpo-badge">TPO HEAD</div>
                <h3 className="tpo-name">{settings?.tpoHeadName || 'Mr. Rahul Sharma'}</h3>
                <p className="tpo-designation">Training & Placement Officer</p>
                <div className="tpo-contact">
                  <div className="tpo-contact-item">
                    <Mail size={16} />
                    <span>{settings?.tpoHeadEmail || 'tpo@gweca.ac.in'}</span>
                  </div>
                  <div className="tpo-contact-item">
                    <Phone size={16} />
                    <span>{settings?.tpoHeadPhone || '+91 12345 67890'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
