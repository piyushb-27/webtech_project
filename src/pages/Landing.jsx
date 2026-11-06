import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing-root">
      {/* City wireframe background layer (color-adjusted blueprint) */}
      <div className="landing-bg-city" />

      {/* Ambient gradient lighting */}
      <div className="landing-bg-overlay" />
      <div className="landing-blob blob-tl" />
      <div className="landing-blob blob-br" />

      {/* Floating Center Card */}
      <main className="landing-card">
        {/* Logo Mark */}
        <div className="landing-logo-wrap">
          <div className="landing-logo-box">
            <span className="material-symbols-outlined">domain</span>
          </div>
          <div className="landing-logo-ring" />
        </div>

        {/* Brand Name */}
        <div className="landing-brand">
          <h1 className="landing-brand-name">Estora</h1>
          <span className="landing-brand-subtitle">Real Estate Manager</span>
        </div>

        {/* Tagline */}
        <p className="landing-tagline">
          Manage listings, track deals, and keep your portfolio<br />
          ledger up-to-date — all in one place.
        </p>

        {/* Navigation Pill Group */}
        <div className="landing-nav-track">
          <Link to="/properties" className="landing-nav-pill">
            <span className="landing-pill-icon-wrap">
              <span className="material-symbols-outlined">apartment</span>
            </span>
            <div className="landing-pill-text">
              <span className="landing-pill-label">Properties</span>
              <span className="landing-pill-desc">Browse &amp; manage listings</span>
            </div>
            <span className="material-symbols-outlined landing-pill-arrow">arrow_forward</span>
          </Link>

          <Link to="/deals" className="landing-nav-pill">
            <span className="landing-pill-icon-wrap deals">
              <span className="material-symbols-outlined">handshake</span>
            </span>
            <div className="landing-pill-text">
              <span className="landing-pill-label">Deals</span>
              <span className="landing-pill-desc">Track settlements &amp; escrow</span>
            </div>
            <span className="material-symbols-outlined landing-pill-arrow">arrow_forward</span>
          </Link>
        </div>

        {/* Footer note */}
        <p className="landing-footer-note">
          <span className="material-symbols-outlined">shield</span>
          Secured · Real-time sync · Portfolio-grade
        </p>
      </main>
    </div>
  )
}

export default Landing
