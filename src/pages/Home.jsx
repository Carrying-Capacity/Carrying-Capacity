import { useNavigate } from 'react-router-dom';
import { Zap, Network, TrendingUp, Map as MapIcon, Database, GitBranch, ArrowRight, Layers } from 'lucide-react';
import MiniMapPreview from '../components/MiniMapPreview';
import './Home.css';

const PROCESS_STEPS = [
  {
    icon: TrendingUp,
    title: "Phase Estimation Process",
    description: "We use machine learning algorithms to predict which electrical phase each house is connected to. This is critical for load balancing and network planning when phase information is incomplete or unavailable.",
    path: "/phase_estimate",
    gradient: "from-purple-500 to-pink-500",
    details: [
      "Analyses voltage patterns and consumption data",
      "Predicts phase allocation (A, B, or C) for each house"
    ]
  },
  {
    icon: Network,
    title: "Network Topology Generation",
    description: "Our system generates the connection of houses inside the network. This helps generate network topology.",
    path: "/network_estimate",
    gradient: "from-green-500 to-emerald-500",
    details: [
      "Generates connection order for houses",
      "Generates connection topology for transformers"
    ]
  },
  {
    icon: GitBranch,
    title: "Street Network Generation",
    description: "This tool generates electrical network layouts based on network topology. It creates transformer placements and connection topologies based on street geometry and expected load.",
    path: "/street_gen",
    gradient: "from-orange-500 to-red-500",
    details: [
      "Analyses street layouts and building locations",
      "Generates physical connection topology"
    ]
  },
  {
    icon: Database,
    title: "Data Processing Pipeline",
    description: "Our backend processes raw smart meter data alone. Data is cleaned, validated, and stored in a structured format for analysis and visualisation.",
    path: "/data_processing_info",
    gradient: "from-indigo-500 to-blue-500",
    details: [
      "Ingests data from multiple sources (CSV, GIS, databases)",
      "Validates and cleans smart meter data",
      "Stores processed data in Supabase for fast querying"
    ]
  },
  {
    icon: Layers,
    title: "Interactive Interface",
    description: "The frontend provides an intuitive interface for exploring network data. Built with React and modern web technologies, it enables real-time interaction with complex network datasets.",
    path: "/front_end",
    gradient: "from-pink-500 to-rose-500",
    details: [
      "React-based application",
      "Real-time data fetching from Supabase",
      "Responsive design for desktop and mobile devices"
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-modern">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>Electrical Network Analysis Platform</span>
          </div>
          
          <h1 className="hero-title">
            Understanding Network
            <span className="hero-title-gradient">Carrying Capacity</span>
          </h1>
          
          <p className="hero-description">
            This platform analyses electrical distribution networks by processing only smart meter data. 
            Our tool help visualise network structure, 
            estimate phase allocation, and predict load distribution across transformers.
          </p>
          
          <div className="hero-actions">
            <button 
              className="hero-btn-primary"
              onClick={() => navigate('/transformer')}
            >
              <span>View Network Map</span>
              <ArrowRight size={20} />
            </button>
            <button 
              className="hero-btn-secondary"
              onClick={() => navigate('/data_processing_info')}
            >
              Data Processing Details
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <MiniMapPreview />
        </div>
      </section>

      {/* Process Explanation Section */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="features-title">How Our System Works</h2>
          <p className="features-subtitle">
            A breakdown of each step of the process
          </p>
        </div>

        <div className="features-grid">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="feature-card"
                onClick={() => navigate(step.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(step.path);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Learn about ${step.title}`}
              >
                <div className={`feature-icon bg-gradient-to-br ${step.gradient}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">{step.title}</h3>
                <p className="feature-description">{step.description}</p>
                
                {/* Process Details */}
                <ul className="process-details">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="process-detail-item">
                      <span className="detail-bullet">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="feature-arrow">
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
