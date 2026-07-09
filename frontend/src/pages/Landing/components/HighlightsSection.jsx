import { Users, Briefcase, TrendingUp, Trophy, UserCheck } from 'lucide-react';
import useScrollAnimation from '../../../hooks/useScrollAnimation';
import './HighlightsSection.css';

const placementHighlights = [
  { value: '2,487+', label: 'Students Registered', icon: Users },
  { value: '1,735+', label: 'Students Placed', icon: UserCheck },
  { value: '69.8%', label: 'Placement Rate', icon: TrendingUp },
  { value: '₹ 52 LPA', label: 'Highest Package', icon: Trophy },
];

export default function HighlightsSection() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.15 });

  return (
    <section className="highlights-section" id="highlights">
      <h2 className="section-heading">PLACEMENT HIGHLIGHTS</h2>
      <div
        ref={ref}
        className={`highlights-grid ${isVisible ? 'highlights-animated' : ''}`}
      >
        {placementHighlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="highlight-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
  );
}
