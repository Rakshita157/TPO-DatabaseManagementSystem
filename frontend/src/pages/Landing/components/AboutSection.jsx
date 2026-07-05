import { MessageSquare, Building, BarChart3, Briefcase } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './AboutSection.css';

const aboutFeatures = [
  { title: 'Career Guidance', description: 'End-to-end guidance for your career path', icon: MessageSquare },
  { title: 'Industry Connect', description: 'Strong network with top recruiters', icon: Building },
  { title: 'Training & Development', description: 'Comprehensive training for skill enhancement', icon: BarChart3 },
  { title: 'Placement Support', description: 'End-to-end support till you get placed', icon: Briefcase },
];

export default function AboutSection({ collegeImage }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="about-section" id="about">
      <div
        ref={ref}
        className={`about-content ${isVisible ? 'about-animated' : ''}`}
      >
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
  );
}
