import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import AuthContainer from './pages/Auth/AuthContainer'
import Registration from './pages/Student/Registration'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/student-registration" element={<Registration />} />
      </Routes>
    </Router>
  )
}

export default App
