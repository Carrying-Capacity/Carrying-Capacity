import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/logo.svg";
import Home from "./pages/home";
import PhaseEstimate from "./pages/PhaseEstimate";
import NetworkEstimate from "./pages/NetworkEstimate";
import StreetGeneration from "./pages/StreetGeneration";
import DataProcessingInfo from "./pages/DataProcessingInfo";
import FrontEnd from "./pages/FrontEnd";
import Transformer from "./TransformerGraphWrapper";
import "./styles/shared.css";

function RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if there's a redirect parameter in the URL
        const urlParams = new URLSearchParams(location.search);
        const redirectPath = urlParams.get('redirect');
        
        if (redirectPath) {
            // Remove the redirect parameter and navigate to the intended path
            navigate(redirectPath, { replace: true });
        }
    }, [navigate, location]);

    return null;
}

function NavDropdown() {
  const navigate = useNavigate();
  const handleChange = (e) => {
    const path = e.target.value;
    if (path) navigate(path);
  };

  return (
    <select className="nav-dropdown" onChange={handleChange} defaultValue="">
      <option value="" disabled>Navigate to page...</option>
      <option value="/">Home</option>
      <option value="/transformer">Interactable Map</option>
      <option value="/data_processing_info">Data Processing</option>
      <option value="/phase_estimate">Phase Estimation</option>
      <option value="/network_estimate">Network Estimation</option>
      <option value="/street_gen">Street Generation</option>
      <option value="/front_end">Front End</option>
    </select>
  );
}

export default function App() {
  return (
    <Router basename="/Carrying-Capacity">
      <RedirectHandler />
      <div style={{ height: "100vh", display: "flex", flexDirection: "column"}}>
        <nav className="nav-container">
          <div className="nav-logo">
            <img src={logo} alt="Logo" />
            <h1>Carrying Capacity Website</h1>
          </div>
          <NavDropdown />
        </nav>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phase_estimate" element={<PhaseEstimate />} />
            <Route path="/network_estimate" element={<NetworkEstimate />} />
            <Route path="/street_gen" element={<StreetGeneration/>} />
            <Route path="/front_end" element={<FrontEnd/>} />
            <Route path="/data_processing_info" element={<DataProcessingInfo />} />
            <Route path="/transformer" element={<Transformer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}