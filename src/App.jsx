import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Properties from './pages/Properties'
import Deals from './pages/Deals'
import './index.css'

function AppShell() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/deals" element={<Deals />} />
      </Routes>
      <footer className="app-footer">
        <p className="app-footer-credit">
          <span className="app-footer-label">Made by</span>{' '}
          <span className="app-footer-author">Vandita Nawani <span className="app-footer-id">(24BIT167)</span></span>{' '}
          <span className="app-footer-label">and</span>{' '}
          <span className="app-footer-author">Piyush Bajaj <span className="app-footer-id">(24BIT181)</span></span>
        </p>
      </footer>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
