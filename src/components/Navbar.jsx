import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-brand">
            <div className="brand-logo">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div className="brand-text">
              <span className="brand-title">EstateHQ</span>
              <span className="brand-subtitle">Real Estate Manager</span>
            </div>
          </div>

          <div className="navbar-divider" />

          <nav className="nav-pill-group">
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                isActive ? 'nav-pill-item active' : 'nav-pill-item'
              }
            >
              <span className="material-symbols-outlined">apartment</span>
              <span>Properties</span>
            </NavLink>
            <NavLink
              to="/deals"
              className={({ isActive }) =>
                isActive ? 'nav-pill-item active' : 'nav-pill-item'
              }
            >
              <span className="material-symbols-outlined">handshake</span>
              <span>Deals</span>
            </NavLink>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="portfolio-status-chip">
            <span className="status-live-dot" />
            <span className="portfolio-name">Main Portfolio</span>
            <span className="portfolio-tag">v2.4</span>
          </div>
          <div className="user-avatar-badge" title="Estate Portfolio Admin">
            HQ
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
