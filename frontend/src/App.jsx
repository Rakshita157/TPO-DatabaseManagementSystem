import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import AuthContainer from './pages/Auth/AuthContainer'
import Registration from './pages/Student/Registration'
import StudentProfile from './pages/Student/Profile'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/student-registration" element={<Registration />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Routes>
    </Router>
  )
}

export default App
