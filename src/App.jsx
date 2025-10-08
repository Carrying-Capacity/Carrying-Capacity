import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/logo.svg";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
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

export default function App() {
    return (
        <Router basename="/Carrying-Capacity">
            <RedirectHandler />
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <nav className="nav-container">
                    <div className="nav-logo">
                        <img src={logo} alt="Logo" />
                        <h1>Phase Identification Map</h1>
                    </div>

                    <div className="nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                        <Link to="/transformer" className="nav-link">Transformer</Link>
                    </div>
                </nav>

                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/transformer" element={<Transformer />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
