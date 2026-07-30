import { User } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './CoordinatorsSection.css';

export default function CoordinatorsSection({ settings, facultyCoordinators, studentCoordinators, getImageUrl }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.05 });

  const tpoHead = settings?.tpoHeadName
    ? [{ name: settings.tpoHeadName, photo: settings.tpoHeadPhoto }]
    : [];

  const faculty = (facultyCoordinators || []).map((f) => ({
    name: f.fullName,
    photo: f.photo,
  }));

  const students = (studentCoordinators || []).map((s) => ({
    name: s.user?.fullName || 'Student Coordinator',
    photo: null,
  }));

  const allCoordinators = [...tpoHead, ...faculty, ...students];

  return (
    <section className="coordinators-section">
      <div className="coordinators-inner">
        <div className="coordinators-banner">
          <h2 className="coordinators-banner-heading">
            TRAINING & PLACEMENT CELL COORDINATORS
          </h2>
        </div>

        <div
          ref={ref}
          className={`coordinators-grid ${isVisible ? 'coordinators-animated' : ''}`}
        >
          {allCoordinators.map((coord, index) => {
            const photoUrl = coord.photo ? getImageUrl(coord.photo) : null;
            return (
              <div
                key={`${coord.name}-${index}`}
                className="coordinator-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="coordinator-photo-wrap">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={coord.name}
                      className="coordinator-photo"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="coordinator-photo-placeholder"
                    style={{ display: photoUrl ? 'none' : 'flex' }}
                  >
                    <User size={32} />
                  </div>
                </div>
                <h3 className="coordinator-name">{coord.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
