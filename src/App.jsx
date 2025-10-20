import { useEffect, memo } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import PhaseEstimate from "./pages/PhaseEstimate";
import NetworkEstimate from "./pages/NetworkEstimate";
import StreetGeneration from "./pages/StreetGeneration";
import DataProcessingInfo from "./pages/DataProcessingInfo";
import FrontEnd from "./pages/FrontEnd";
import Transformer from "./components/TransformerGraphWrapper";
import ReferencesCitations from "./pages/ReferencesCitations";
import "./styles/shared.css";

const ScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll window
        window.scrollTo(0, 0);
        // Also scroll document element and body for better compatibility
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    return null;
};

ScrollToTop.displayName = "ScrollToTop";

const RedirectHandler =() => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const redirectPath = urlParams.get('redirect');
        
        if (redirectPath) {
            navigate(redirectPath, { replace: true });
        }
    }, [navigate, location.search]);

    return null;
};

RedirectHandler.displayName = "RedirectHandler";

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/Carrying-Capacity">
        <ScrollToTop />
        <RedirectHandler />
        <div className="app-container">
          <Navigation />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/phase_estimate" element={<PhaseEstimate />} />
              <Route path="/network_estimate" element={<NetworkEstimate />} />
              <Route path="/street_gen" element={<StreetGeneration />} />
              <Route path="/front_end" element={<FrontEnd />} />
              <Route path="/data_processing_info" element={<DataProcessingInfo />} />
              <Route path="/transformer" element={<Transformer />} />
              <Route path="/references_citations" element={<ReferencesCitations />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}