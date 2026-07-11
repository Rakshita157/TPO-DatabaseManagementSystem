import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import AuthContainer from './pages/Auth/AuthContainer'
import Registration from './pages/Student/Registration'
import StudentProfile from './pages/Student/Profile'
import AdminDashboard from './pages/Admin/Dashboard'
import StudentDetails from './pages/Admin/StudentDetails'
import './App.css'

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/student-registration" element={
          <ProtectedRoute allowedRoles={['STUDENT']}><Registration /></ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/student/:userId" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><StudentDetails /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
