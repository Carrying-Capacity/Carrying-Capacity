# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Phase Identification Map** application - an interactive visualization tool for electrical grid networks that shows the relationships between transformers, houses, and the main electrical grid. The application visualizes electrical power flow paths and predicted phase distributions (A, B, C phases) across a network of houses connected to transformers.

Built with React + Vite using modern JavaScript (ES modules) and leverages the `react-force-graph-2d` library for interactive network visualization.

## Development Commands

### Core Development
```bash
# Start development server with hot reload
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally  
npm run preview

# Lint code using ESLint
npm run lint
```

### Deployment
```bash
# Build and deploy to GitHub Pages
npm run deploy

# Just build (runs automatically before deploy)
npm run predeploy
```

## Code Architecture

### Component Hierarchy
- **App.jsx**: Main application container managing global state (focusNode, selectedNode) and coordinating between graph visualization and UI controls
- **TransformerGraph.jsx**: Core visualization component using ForceGraph2D for interactive network rendering
- **InfoModal.jsx**: Contextual information display for selected nodes
- **main.jsx**: React application entry point

### Data Flow Architecture

**Data Loading (`loadTransformer.js`)**:
- Imports static JSON datasets (tx1.json, tx2.json, tx3.json) representing different transformer networks
- Transforms raw electrical network data into graph format (nodes and links)
- Handles spatial positioning: transformers placed in circular pattern around central grid, houses positioned relative to their transformer

**Graph State Management**:
- `focusNode`: Controls camera focus and zoom behavior
- `selectedNode`: Triggers modal display with node details
- `flowLinks`: Manages animated path highlighting from houses back to grid
- Dynamic zoom-to-fit behavior based on node selection type

**Network Visualization Logic**:
- **Grid node**: Central hub (type: "grid") 
- **Transformer nodes**: Intermediate hubs (type: "transformer") connected to grid
- **House nodes**: Endpoints (type: "house") with electrical phase predictions (A/B/C) and solar panel indicators
- Links represent electrical connections following `prev_node`/`next_node` relationships

### Key Interaction Patterns

**Node Selection Behavior**:
- **Transformer selection**: Zooms to show all houses connected to that transformer
- **House selection**: Traces and animates the electrical path back to the main grid via `prev_node` chain
- **Modal display**: Shows contextual information (house details, phase, solar status, transformer info)

**Visual Encoding**:
- Node icons: Different images for grid, transformer, and house types
- Phase colors: Houses show semi-transparent colored backgrounds (A=red, B=green, C=blue)
- Animated flow: Dashed orange lines show power flow path when house is selected
- Responsive sizing: Icons scale appropriately for different node types

### Data Structure

**Node Properties**:
- `id`: Unique identifier
- `type`: "grid", "transformer", or "house"  
- `prev_node`/`next_node`: Electrical connectivity chain
- `x_meters`/`y_meters`: Physical coordinates
- `predicted_phase`: Electrical phase assignment (A/B/C)
- `solar`: Boolean indicating solar panel presence
- `HouseID`: Human-readable house identifier

**Spatial Coordinate System**:
- Transformer datasets use meter-based coordinates
- Graph positions calculated by scaling meter coordinates and positioning relative to transformer locations
- Grid at origin (0,0), transformers in circle, houses scaled and offset from their transformer

### Technology Stack

- **React 19**: Modern hooks-based components
- **Vite**: Fast development server and build tool with HMR
- **Tailwind CSS 4**: Utility-first styling via Vite plugin
- **ForceGraph2D**: Interactive network visualization with canvas rendering
- **ESLint**: Code linting with React-specific rules