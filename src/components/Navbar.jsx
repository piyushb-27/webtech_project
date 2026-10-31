import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <span className="material-symbols-outlined">domain</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">EstateHQ</span>
            <span className="brand-subtitle">Real Estate Manager</span>
          </div>
        </div>

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

        {/* Balance spacer for symmetric centering */}
        <div className="navbar-end-spacer" />
      </div>
    </header>
  )
}

export default Navbar
