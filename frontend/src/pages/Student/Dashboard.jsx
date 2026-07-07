import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (!user || !user.collegeEmail) {
    navigate('/auth');
    return null;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#102a43' }}>Welcome, {user.fullName}</h1>
          <p style={{ color: '#5b7388', margin: '4px 0 0 0' }}>{user.collegeEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        <DashboardCard title="My Profile" description="View and edit your profile information" />
        <DashboardCard title="Placement Drives" description="View upcoming and ongoing placement drives" />
        <DashboardCard title="Applications" description="Track your job applications" />
        <DashboardCard title="Documents" description="Upload and manage your documents" />
      </div>
    </div>
  );
}

function DashboardCard({ title, description }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', color: '#102a43' }}>{title}</h3>
      <p style={{ margin: 0, color: '#5b7388', fontSize: '14px' }}>{description}</p>
    </div>
  );
}
