import { useEffect, memo, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Navigation, NAVIGATION_ROUTES } from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
const Home = lazy(() => import("./pages/Home"));
const PhaseEstimate = lazy(() => import("./pages/PhaseEstimate"));
const NetworkEstimate = lazy(() => import("./pages/NetworkEstimate"));
const StreetGeneration = lazy(() => import("./pages/StreetGeneration"));
const DataProcessingInfo = lazy(() => import("./pages/DataProcessingInfo"));
const FrontEnd = lazy(() => import("./pages/FrontEnd"));
const Transformer = lazy(() => import("./components/TransformerGraphWrapper"));
const ReferencesCitations = lazy(() => import("./pages/ReferencesCitations"));

const ScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll window
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return null;
};

ScrollToTop.displayName = "ScrollToTop";

const RedirectHandler = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const redirectPath = searchParams.get('redirect');
        
        if (redirectPath) {
            // Validate redirect path against allowed routes
            const validPaths = NAVIGATION_ROUTES.map(route => route.path);
            const normalizedPath = redirectPath.startsWith('/') ? redirectPath : '/' + redirectPath;
            
            if (validPaths.includes(normalizedPath)) {
                navigate(normalizedPath, { replace: true });
            } else {
                // Invalid redirect, navigate to home
                navigate('/', { replace: true });
            }
        }
    }, [navigate, searchParams]);

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