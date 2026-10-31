import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Properties from './pages/Properties'
import Deals from './pages/Deals'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/deals" element={<Deals />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
