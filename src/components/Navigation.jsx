import React, { memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const NAVIGATION_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/transformer", label: "Interactable Map" },
  { path: "/data_processing_info", label: "Data Processing" },
  { path: "/phase_estimate", label: "Phase Estimation" },
  { path: "/network_estimate", label: "Network Estimation" },
  { path: "/street_gen", label: "Street Generation" },
  { path: "/front_end", label: "Front End" }
];

const NavDropdown = memo(() => {
  const navigate = useNavigate();
  
  const handleChange = useCallback((e) => {
    const path = e.target.value;
    if (path) navigate(path);
  }, [navigate]);

  return (
    <select 
      className="nav-dropdown" 
      onChange={handleChange} 
      defaultValue=""
      aria-label="Navigate to page"
    >
      <option value="" disabled>Navigate to page...</option>
      {NAVIGATION_ROUTES.map(({ path, label }) => (
        <option key={path} value={path}>{label}</option>
      ))}
    </select>
  );
});

NavDropdown.displayName = "NavDropdown";

export const Navigation = memo(() => {
  return (
    <nav className="nav-container">
      <Link to="/" className="nav-logo">
        <img src={logo} alt="Carrying Capacity Logo" />
        <h1>Carrying Capacity Website</h1>
      </Link>
      <NavDropdown />
    </nav>
  );
});

Navigation.displayName = "Navigation";
