import { memo, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import favicon from "/favicon.svg";

export const NAVIGATION_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/transformer", label: "Interactable Map" },
  { path: "/data_processing_info", label: "Data Processing" },
  { path: "/phase_estimate", label: "Phase Estimation" },
  { path: "/network_estimate", label: "Network Estimation" },
  { path: "/street_gen", label: "Street Generation" },
  { path: "/front_end", label: "Front End" },
  { path: "/references_citations", label: "References" }
];

const NavLink = memo(({ to, label, isActive }) => (
  <Link
    to={to}
    className={`nav-link-item ${isActive ? 'nav-link-active' : ''}`}
  >
    {label}
  </Link>
));

NavLink.displayName = "NavLink";

const MobileMenu = memo(({ isOpen, onClose, currentPath }) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">Navigation</h2>
          <button onClick={onClose} className="mobile-menu-close" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-menu-nav">
          {NAVIGATION_ROUTES.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-menu-link ${currentPath === path ? 'mobile-menu-link-active' : ''}`}
              onClick={onClose}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
});

MobileMenu.displayName = "MobileMenu";

export const Navigation = memo(() => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav className="nav-container-modern">
        <div className="nav-content">
          <Link to="/" className="nav-logo-modern">
            <div className="nav-logo-icon-glass">
              <img src={favicon} alt="Logo" className="nav-logo-svg" />
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-title">Carrying Capacity</span>
              <span className="nav-logo-subtitle">LV Network Estimator</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            {NAVIGATION_ROUTES.slice(1).map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                label={label}
                isActive={location.pathname === path}
              />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="nav-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        currentPath={location.pathname}
      />
    </>
  );
});

Navigation.displayName = "Navigation";
