import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HeroSection from './components/HeroSection';
import HighlightsSection from './components/HighlightsSection';
import AboutSection from './components/AboutSection';
import RecruitersSection from './components/RecruitersSection';
import FooterSection from './components/FooterSection';
import ScrollToTop from './components/ScrollToTop';
import './Landing.css';
import collegeImage from '../../assets/logos/College Image.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const recruiterLogos = import.meta.glob('../../assets/logos/*', { eager: true, import: 'default' });

const placeholderRecruiters = Object.entries(recruiterLogos)
  .filter(([path]) => !path.includes('govt.mahila'))
  .map(([, src]) => src);

export default function Landing() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/college-settings`);
        setSettings(data.collegeSettings);
      } catch (error) {
        console.error('Unable to load college settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000/${photoPath}`;
  };

  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection
        settings={settings}
        loading={loading}
        getImageUrl={getImageUrl}
        collegeImage={collegeImage}
      />
      <main className="main-content">
        <HighlightsSection />
        <AboutSection collegeImage={collegeImage} />
        <RecruitersSection recruiters={placeholderRecruiters} />
      </main>
      <FooterSection settings={settings} />
      <ScrollToTop />
    </div>
  );
}
