import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import AuthContainer from './pages/Auth/AuthContainer'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthContainer />} />
      </Routes>
    </Router>
  )
}

export default App
