import { Mail, Phone } from 'lucide-react';
import collegeLogo from '../../../assets/logos/govt.mahila_engineering-removebg-preview.png';
import './FooterSection.css';

const socialLinks = [
  { label: 'Facebook', href: '#', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
  { label: 'LinkedIn', href: '#', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z', rect: { x: 2, y: 9, w: 4, h: 12 }, circle: { cx: 4, cy: 4, r: 2 } },
  { label: 'Instagram', href: '#', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', rect: { x: 2, y: 2, w: 20, h: 20, rx: 5, ry: 5 }, line: { x1: 17.5, y1: 6.5, x2: 17.51, y2: 6.5 } },
  { label: 'YouTube', href: '#', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z', polygon: { points: '9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02' } },
];

function SocialIcon({ link }) {
  return (
    <a href={link.href} className="footer-social-link" aria-label={link.label}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d={link.path} />
        {link.rect && <rect x={link.rect.x} y={link.rect.y} width={link.rect.w} height={link.rect.h} rx={link.rect.rx} ry={link.rect.ry} />}
        {link.circle && <circle cx={link.circle.cx} cy={link.circle.cy} r={link.circle.r} />}
        {link.polygon && <polygon points={link.polygon.points} fill="white" />}
        {link.line && <line x1={link.line.x1} y1={link.line.y1} x2={link.line.x2} y2={link.line.y2} stroke="currentColor" strokeWidth="2" />}
      </svg>
    </a>
  );
}

export default function FooterSection({ settings }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
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
            {socialLinks.map((link) => (
              <SocialIcon key={link.label} link={link} />
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h3>QUICK LINKS</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#about">About TPO</a></li>
            <li><a href="#contact">Contact</a></li>
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
        <p>&copy; {currentYear} GWECA Training & Placement Office. All Rights Reserved</p>
      </div>
    </footer>
  );
}
