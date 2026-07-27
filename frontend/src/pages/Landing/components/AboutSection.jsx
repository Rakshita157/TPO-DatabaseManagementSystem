import { Eye, Target, CheckCircle } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './AboutSection.css';

const missionPoints = [
  'To make the students aware about the corporate culture by organizing guest lectures, workshops, seminars and industrial trainings by experienced personnel from the Industry.',
  'To organize placement and internship drives for our students within and outside the campus.',
  'To provide equal opportunity to all eligible students for placements and internships.',
];

export default function AboutSection() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="about-section" id="about">
      <div
        ref={ref}
        className={`vm-wrapper ${isVisible ? 'vm-animated' : ''}`}
      >
        <h2 className="vm-main-heading">
          VISION & MISSION OF<br />TRAINING & PLACEMENT CELL
        </h2>

        <div className="vm-content">
          <div className="vm-card vm-vision-card">
            <div className="vm-card-header">
              <div className="vm-icon-circle vm-vision-icon">
                <Eye size={22} />
              </div>
              <h3 className="vm-card-title">VISION</h3>
            </div>
            <p className="vm-vision-text">
              &ldquo;To provide necessary training and skill set to students to
              make them Industry ready and to achieve 100% placement by
              providing them adequate job opportunities.&rdquo;
            </p>
          </div>

          <div className="vm-card vm-mission-card">
            <div className="vm-card-header">
              <div className="vm-icon-circle vm-mission-icon">
                <Target size={22} />
              </div>
              <h3 className="vm-card-title">MISSION</h3>
            </div>
            <ol className="vm-mission-list">
              {missionPoints.map((point, index) => (
                <li key={index} className="vm-mission-item">
                  <div className="vm-mission-check">
                    <CheckCircle size={16} />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
