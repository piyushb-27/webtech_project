import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🏠</span>
        <h1>Real Estate Manager</h1>
      </div>
      <div className="navbar-links">
        <NavLink to="/properties" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Properties
        </NavLink>
        <NavLink to="/deals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Deals
        </NavLink>
      </div>
    </nav>
  )
}

export default Navbar

