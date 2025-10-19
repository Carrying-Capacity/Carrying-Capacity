import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Network, TrendingUp, Map as MapIcon, Database, GitBranch, ArrowRight, Sparkles } from 'lucide-react';
import MiniMapPreview from '../components/MiniMapPreview';
import './Home.css';

const FEATURES = [
  {
    icon: MapIcon,
    title: "Interactive Network Map",
    description: "Visualize and explore your entire electrical network with our interactive 2D force-directed graph.",
    path: "/transformer",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Phase Estimation",
    description: "Analyze and predict phase distribution across your network with advanced algorithms.",
    path: "/phase_estimate",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Network,
    title: "Network Estimation",
    description: "Predict network load, performance metrics, and capacity constraints in real-time.",
    path: "/network_estimate",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: GitBranch,
    title: "Street Generation",
    description: "Automatically generate optimized network layouts for streets and neighborhoods.",
    path: "/street_gen",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Database,
    title: "Data Processing",
    description: "Process and analyze large-scale electrical network data with our powerful tools.",
    path: "/data_processing_info",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: Sparkles,
    title: "Front End Interface",
    description: "Interactive interface for comprehensive data input, analysis, and visualization.",
    path: "/front_end",
    gradient: "from-pink-500 to-rose-500"
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
            <span>Next-Generation Network Intelligence</span>
          </div>
          
          <h1 className="hero-title">
            Electrical Network Planning
            <span className="hero-title-gradient">Reimagined</span>
          </h1>
          
          <p className="hero-description">
            Model, analyze, and optimize electrical networks with cutting-edge visualization tools.
            Designed for engineers and planners who demand precision and speed.
          </p>
          
          <div className="hero-actions">
            <button 
              className="hero-btn-primary"
              onClick={() => navigate('/transformer')}
            >
              <span>Explore Network Map</span>
              <ArrowRight size={20} />
            </button>
            <button 
              className="hero-btn-secondary"
              onClick={() => navigate('/data_processing_info')}
            >
              Learn More
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Network Nodes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Real-time</div>
              <div className="hero-stat-label">Analysis</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">99.9%</div>
              <div className="hero-stat-label">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <MiniMapPreview />
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="features-title">Powerful Features</h2>
          <p className="features-subtitle">
            Everything you need to manage and optimize electrical networks
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card"
                onClick={() => navigate(feature.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(feature.path);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${feature.title}`}
              >
                <div className={`feature-icon bg-gradient-to-br ${feature.gradient}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to optimize your network?</h2>
          <p className="cta-description">
            Start exploring our tools and transform the way you manage electrical networks.
          </p>
          <button 
            className="cta-button"
            onClick={() => navigate('/transformer')}
          >
            <Zap size={20} />
            <span>Get Started Now</span>
          </button>
        </div>
      </section>
    </div>
  );
}
