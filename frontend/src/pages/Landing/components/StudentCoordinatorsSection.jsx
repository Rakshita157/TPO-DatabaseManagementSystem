import { useState } from 'react';
import { User, Eye, EyeOff } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './StudentCoordinatorsSection.css';

const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };
const MAX_VISIBLE = 8;

export default function StudentCoordinatorsSection({ studentCoordinators }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.05 });
  const [showAll, setShowAll] = useState(false);

  const coordinators = (studentCoordinators || []).map((s) => {
    const profile = s.user?.studentProfile;
    const course = profile?.course ? (COURSE_LABELS[profile.course] || profile.course) : '';
    const department = profile?.department || '';
    const courseBranch = [course, department].filter(Boolean).join(' - ') || '-';
    return {
      id: s.userId,
      name: s.user?.fullName || 'Student Coordinator',
      email: s.user?.collegeEmail || '-',
      courseBranch,
    };
  });

  if (coordinators.length === 0) return null;

  const hasMore = coordinators.length > MAX_VISIBLE;
  const visibleCoordinators = showAll ? coordinators : coordinators.slice(0, MAX_VISIBLE);

  return (
    <section className="student-coordinators-section">
      <div className="student-coordinators-inner">
        <div className="student-coordinators-banner">
          <h2 className="student-coordinators-banner-heading">
            STUDENT COORDINATORS
          </h2>
        </div>

        <div
          ref={ref}
          className={`student-coordinators-grid ${isVisible ? 'student-coordinators-animated' : ''}`}
        >
          {visibleCoordinators.map((coord, index) => (
            <div
              className="student-coordinator-card"
              key={`student-coord-${coord.id}-${index}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="student-coordinator-avatar">
                <User size={28} />
              </div>
              <h3 className="student-coordinator-name">{coord.name}</h3>
              <p className="student-coordinator-email">{coord.email}</p>
              <p className="student-coordinator-course">{coord.courseBranch}</p>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="student-coordinators-actions">
            <button
              type="button"
              className="student-coordinators-viewall-btn"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? (
                <>
                  <EyeOff size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <Eye size={16} />
                  View All
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
