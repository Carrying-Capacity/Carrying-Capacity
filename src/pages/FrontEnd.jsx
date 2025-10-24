import React from 'react';
import {CheckCircle, ArrowRight } from 'lucide-react';
import './FrontEnd.css';

// Access versions injected by Vite from package.json
const VERSIONS = typeof __PKG_VERSIONS__ !== 'undefined' ? __PKG_VERSIONS__ : {};

const TECHNOLOGIES = [
  {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    name: "React",
    version: VERSIONS.react || "19.x",
    description: "Modern JavaScript library for building user interfaces",
    features: [
      "Component-based architecture for reusable UI elements",
      "Hooks for state management and side effects",
      "React Router for seamless navigation"
    ],
    justification: "React's component-based architecture allows us to build a modular, maintainable codebase. Hooks like useState and useEffect provide elegant state management without class components.",
    useCases: [
      "Navigation component with responsive design",
      "Interactive transformer graph with real-time updates",
      "Dynamic comparison lists and data filtering",
      "Modal dialogs and overlay components"
    ]
  },
  {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    name: "Tailwind CSS",
    version: VERSIONS.tailwindcss || "4.x",
    description: "Utility-first CSS framework for rapid UI development",
    features: [
      "Utility classes for rapid prototyping",
      "Responsive design with mobile support",
    ],
    justification: "Tailwind enables rapid development with utility classes while maintaining design consistency.",
    useCases: [
      "Responsive grid layouts for feature cards",
      "Consistent spacing and typography system",
      "Custom color palette for network phases"
    ]
  },
  {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
    name: "Supabase",
    version: VERSIONS.supabase || "2.x",
    description: "Open-source Firebase alternative with PostgreSQL",
    features: [
      "Real-time database subscriptions",
      "Row-level security for data protection",
      "PostgreSQL for complex queries and relationships"
    ],
    justification: "Supabase provides a robust backend infrastructure without managing servers. Real-time subscriptions enable live updates when network data changes. PostgreSQL's powerful query capabilities handle complex network topology queries efficiently.",
    useCases: [
      "Storing transformer and house network data",
      "Real-time updates for collaborative viewing",
      "Complex queries for phase estimation"
    ]
  },
  {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    name: "React Force Graph",
    version: VERSIONS.forceGraph || "1.x",
    description: "Force-directed graph visualization using Canvas/WebGL",
    features: [
      "WebGL rendering for thousands of nodes",
      "Physics-based force simulation",
      "Custom node and link rendering",
      "Interactive zoom, pan, and focus controls"
    ],
    justification: "React Force Graph leverages WebGL for high-performance rendering of complex electrical networks. The force-directed layout naturally reveals network topology and relationships. Custom rendering allows us to visualize different node types (transformers, houses, streets) with distinct appearances.",
    useCases: [
      "Main network visualization with 1000+ nodes",
      "Interactive exploration of transformer connections",
      "Path tracing from houses to feeders",
      "Zoom-to-fit for focused network sections"
    ]
  },
  {
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    name: "Recharts",
    version: VERSIONS.recharts || "3.x",
    description: "Composable charting library built on React components",
    features: [
      "Declarative chart composition",
      "Responsive and animated charts",
      "Custom tooltips and legends",
      "Support for multiple chart types"
    ],
    justification: "Recharts' declarative API aligns perfectly with React's component model. Responsive charts adapt to different screen sizes automatically. Custom tooltips provide detailed insights into time-series data without cluttering the interface.",
    useCases: [
      "Time-series comparison of house properties",
      "Multi-line charts for voltage/current analysis",
      "Custom legends with scrollable overflow",
      "Interactive tooltips with detailed metrics"
    ]
  }
];


export default function FrontEnd() {
  return (
    <div className="frontend-modern">
        {/* Hero Section */}
        <div className="frontend-hero">
          <div className="frontend-hero-content">
            <h1 className="frontend-title">
              Front End
            </h1>
            <p className="frontend-description">
              Methodology and libraries used for the website front-end
            </p>
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="frontend-section">
          <div className="frontend-section-header">
            <h2 className="frontend-section-title">Core Technologies</h2>
            <p className="frontend-section-subtitle">
              Five powerful tools working together to create an exceptional user experience
            </p>
          </div>

          <div className="technologies-grid">
            {TECHNOLOGIES.map((tech, index) => (
              <div key={tech.name} className="tech-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="tech-card-header">
                  <div className="tech-logo-container">
                    <img src={tech.logo} alt={`${tech.name} logo`} className="tech-logo" />
                  </div>
                  <div className="tech-info">
                    <h3 className="tech-name">{tech.name}</h3>
                    <span className="tech-version">v{tech.version}</span>
                  </div>
                </div>

                <p className="tech-description">{tech.description}</p>

                <div className="tech-section">
                  <h4 className="tech-section-title">Key Features</h4>
                  <ul className="tech-features-list">
                    {tech.features.map((feature, i) => (
                      <li key={i} className="tech-feature-item">
                        <CheckCircle size={16} className="tech-feature-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tech-section">
                  <h4 className="tech-section-title">Design Justification</h4>
                  <p className="tech-justification">{tech.justification}</p>
                </div>

                <div className="tech-section">
                  <h4 className="tech-section-title">Implementation Examples</h4>
                  <ul className="tech-usecases-list">
                    {tech.useCases.map((useCase, i) => (
                      <li key={i} className="tech-usecase-item">
                        <ArrowRight size={14} className="tech-usecase-icon" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
