import { useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, TrendingUp, Building2, Trophy, UserCheck, Building, BarChart3, MessageSquare, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './Landing.css';
import collegeLogo from '../../assets/logos/govt.mahila_engineering-removebg-preview.png';
import collegeImage from '../../assets/logos/College Image.jpg';

const recruiterLogos = import.meta.glob('../../assets/logos/*', { eager: true, import: 'default' });

const placeholderRecruiters = Object.entries(recruiterLogos)
  .filter(([path]) => !path.includes('govt.mahila'))
  .map(([, src]) => src);

const placementHighlights = [
  {
    value: '2,487+',
    label: 'Students Registered',
    icon: Users,
  },
  {
    value: '1,735+',
    label: 'Students Placed',
    icon: UserCheck,
  },
  {
    value: '69.8%',
    label: 'Placement Rate',
    icon: TrendingUp,
  },
  {
    value: '150+',
    label: 'Recruiting Companies',
    icon: Building2,
  },
  {
    value: '₹ 52 LPA',
    label: 'Highest Package',
    icon: Trophy,
  },
];

const aboutFeatures = [
  {
    title: 'Career Guidance',
    description: 'End-to-end guidance for your career path',
    icon: MessageSquare,
  },
  {
    title: 'Industry Connect',
    description: 'Strong network with top recruiters',
    icon: Building,
  },
  {
    title: 'Training & Development',
    description: 'Comprehensive training for skill enhancement',
    icon: BarChart3,
  },
  {
    title: 'Placement Support',
    description: 'End-to-end support till you get placed',
    icon: Briefcase,
  },
];

export default function Landing() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/college-settings');
        setSettings(data);
      } catch (error) {
        console.error('Unable to load college settings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Function to get the full image URL
  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    // If it's already a full URL, return it
    if (photoPath.startsWith('http')) return photoPath;
    // Normalize: remove leading slash to avoid double-slash in URL
    const normalized = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    return `http://localhost:5000/${normalized}`;
  };

  const recruiterPage = useMemo(() => {
    const pageSize = 5;
    const start = page * pageSize;
    return placeholderRecruiters.slice(start, start + pageSize);
  }, [page]);

  const totalPages = Math.ceil(placeholderRecruiters.length / 5);

  return (
    <div className="landing-page">
      <Navbar />
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
              <button className="hero-btn-primary">
                Student Login →
              </button>
            </div>
            <p className="hero-subtext">
              New user? <a href="/auth">Login to create your profile</a>
            </p>
          </div>

          <div className="tpo-card">
            {loading ? (
              <div className="tpo-loading">Loading officer information…</div>
            ) : settings ? (
              <>
                <div className="tpo-image-container">
                  <img
                    className="tpo-photo"
                    src={getImageUrl(settings.tpoHeadPhoto) || collegeImage}
                    alt={settings.tpoHeadName || 'TPO Head'}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = collegeImage;
                    }}
                  />
                </div>
                <div className="tpo-details">
                  <div className="tpo-badge">TPO HEAD</div>
                  <h3 className="tpo-name">{settings.tpoHeadName}</h3>
                  <p className="tpo-designation">Training & Placement Officer</p>
                  <div className="tpo-divider"></div>
                  <div className="tpo-contact-grid">
                    <a href={`mailto:${settings.tpoHeadEmail}`} className="tpo-contact-item">
                      <Mail size={20} className="tpo-icon" />
                      <span>{settings.tpoHeadEmail}</span>
                    </a>
                    <a href={`tel:${settings.tpoHeadPhone}`} className="tpo-contact-item">
                      <Phone size={20} className="tpo-icon" />
                      <span>{settings.tpoHeadPhone}</span>
                    </a>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Placement Highlights Section */}
        <section className="highlights-section">
          <h2 className="section-heading">PLACEMENT HIGHLIGHTS</h2>
          <div className="highlights-grid">
            {placementHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="highlight-item">
                  <div className="highlight-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="highlight-value">{item.value}</h3>
                  <p className="highlight-label">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* About Our TPO Section */}
        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-heading-left">ABOUT OUR TPO</h2>
              <p className="about-description">
                The Training and Placement (TPO) at GWECA acts as a bridge
                between industry and academia. We work closely with students to
                enhance their skills, provide training, and create excellent placement
                opportunities.
              </p>
              <div className="about-features">
                {aboutFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="about-feature">
                      <div className="about-feature-icon">
                        <Icon size={24} />
                      </div>
                      <div className="about-feature-text">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="about-image">
              <img src={collegeImage} alt="Training and Placement Office" />
              <div className="about-image-label">
                TRAINING &<br />PLACEMENT OFFICE
              </div>
            </div>
          </div>
        </section>

        {/* Top Recruiters Section */}
        <section className="recruiters-section">
          <div className="recruiters-content">
            <div className="recruiters-header">
              <h2 className="section-heading">OUR TOP RECRUITERS</h2>
            </div>
            <div className="recruiters-grid">
              {recruiterPage.map((src, index) => (
                <div key={`${src}-${index}`} className="recruiter-logo">
                  <img src={src} alt={`Recruiter ${index + 1}`} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="recruiters-navigation">
                <button
                  className="nav-btn"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  aria-label="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="nav-dots">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <span
                      key={i}
                      className={`nav-dot ${i === page ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    />
                  ))}
                </div>
                <button
                  className="nav-btn"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page === totalPages - 1}
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col footer-brand">
            <div className="footer-logo-section">
              <img src={collegeLogo} alt="GWECA Logo" className="footer-logo" />
              <h3>GWECA<br />Training & Placement Office</h3>
            </div>
            <p>
              We are committed to empowering students with industry-ready
              skills and careers through quality placements and continuous support.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Instagram">ig</a>
              <a href="#" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div className="footer-col">
            <h3>QUICK LINKS</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About TPO</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>CONTACT US</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <span>📍</span>
                <span>GWECA Campus, Knowledge Park,<br />Pratap Nagar, Udai Palpara 301001</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} />
                <span>{settings?.tpoHeadEmail || 'tpo@gweca.ac.in'}</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} />
                <span>{settings?.tpoHeadPhone || '+91 12345 67890'}</span>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>OFFICE TIMINGS</h3>
            <div className="footer-timings">
              <div className="footer-timing-item">
                <span>🕐</span>
                <div>
                  <strong>Monday - Friday</strong>
                  <p>9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="footer-timing-item">
                <span>🕐</span>
                <div>
                  <strong>Saturday</strong>
                  <p>10:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2023 GWECA Training & Placement Office. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
