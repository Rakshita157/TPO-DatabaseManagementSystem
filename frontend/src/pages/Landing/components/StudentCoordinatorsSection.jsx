import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './StudentCoordinatorsSection.css';

const VISIBLE_ROWS = 6;

function getYearSuffix(year) {
  if (year >= 11 && year <= 13) return 'th';
  switch (year % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default function StudentCoordinatorsSection({ studentCoordinators }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.05 });
  const [expanded, setExpanded] = useState(false);

  const rows = (studentCoordinators || []).map((s) => {
    const profile = s.user?.studentProfile;
    const currentYear = profile?.currentYear;
    return {
      name: s.user?.fullName || 'Student Coordinator',
      email: s.user?.collegeEmail || '-',
      year: currentYear ? `${currentYear}${getYearSuffix(currentYear)} Year` : '-',
      branch: profile?.department || profile?.course || '-',
      contact: profile?.phoneNumber || '-',
    };
  });

  if (rows.length === 0) return null;

  const visibleRows = expanded ? rows : rows.slice(0, VISIBLE_ROWS);
  const hasMore = rows.length > VISIBLE_ROWS;

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
          className={`student-coordinators-table-container ${isVisible ? 'student-coordinators-animated' : ''}`}
        >
          <table className="student-coordinators-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Branch</th>
                <th>Contact No.</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={`student-${row.name}-${index}`}>
                  <td>{index + 1}</td>
                  <td className="student-name-cell">{row.name}</td>
                  <td className="student-email-cell">{row.email}</td>
                  <td>{row.year}</td>
                  <td>{row.branch}</td>
                  <td className="student-contact-cell">{row.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <button
              type="button"
              className="student-coordinators-toggle"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show More Coordinators <ChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
