import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './RecruitersSection.css';

export default function RecruitersSection({ recruiters }) {
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const pageSize = 5;
  const totalPages = Math.ceil(recruiters.length / pageSize);

  const recruiterPage = useMemo(() => {
    const start = page * pageSize;
    return recruiters.slice(start, start + pageSize);
  }, [page, recruiters]);

  const nextPage = useCallback(() => {
    setPage((p) => (p + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;
    intervalRef.current = setInterval(nextPage, 4000);
    return () => clearInterval(intervalRef.current);
  }, [totalPages, isPaused, nextPage]);

  return (
    <section className="recruiters-section" id="recruiters">
      <div
        ref={ref}
        className={`recruiters-content ${isVisible ? 'recruiters-animated' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="recruiters-header">
          <h2 className="section-heading">OUR TOP RECRUITERS</h2>
        </div>
        <div className="recruiters-grid">
          {recruiterPage.map((src, index) => (
            <div key={`${src}-${index}`} className="recruiter-logo">
              <img src={src} alt={`Recruiter ${page * pageSize + index + 1}`} />
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="recruiters-navigation">
            <button
              className="nav-btn"
              onClick={prevPage}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="nav-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`nav-dot ${i === page ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
            <button
              className="nav-btn"
              onClick={nextPage}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
