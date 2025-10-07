import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.svg";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Transformer from "./TransformerGraphWrapper";

export default function App() {
    return (
        <Router basename="/Carrying-Capacity">
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <nav
                    style={{
                        flex: "0 0 5vh",
                        backgroundColor: "#333",
                        color: "white",
                        padding: "0.5rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img src={logo} alt="Logo" style={{ width: "32px", height: "32px" }} />
                        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Phase Identification Map</h1>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
                        <Link to="/about" style={{ color: "white", textDecoration: "none" }}>About</Link>
                        <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>Contact</Link>
                        <Link to="/transformer" style={{ color: "white", textDecoration: "none" }}>Transformer</Link>
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
