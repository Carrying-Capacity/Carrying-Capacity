import { useEffect, memo, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
const Home = lazy(() => import("./pages/Home"));
const PhaseEstimate = lazy(() => import("./pages/PhaseEstimate"));
const NetworkEstimate = lazy(() => import("./pages/NetworkEstimate"));
const StreetGeneration = lazy(() => import("./pages/StreetGeneration"));
const DataProcessingInfo = lazy(() => import("./pages/DataProcessingInfo"));
const FrontEnd = lazy(() => import("./pages/FrontEnd"));
const Transformer = lazy(() => import("./components/TransformerGraphWrapper"));
const ReferencesCitations = lazy(() => import("./pages/ReferencesCitations"));
import "./styles/shared.css";

const ScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll window
        window.scrollTo(0, 0);
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
            <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
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
            </Suspense>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}