# Carrying Capacity

Interactive visualization tool for electrical grid phase identification and network topology analysis.

**Live Demo:** https://carrying-capacity.github.io/Carrying-Capacity/

## What It Does

- Visualizes low-voltage electrical network topology with transformers, houses, and street connections
- Estimates phase assignments for single and three-phase customers
- Displays time-series voltage and power data from Supabase
- Interactive force-directed graph with path tracing and comparison tools

## Tech Stack

- **React 19** + **Vite** - Fast development and builds
- **Tailwind CSS 4** - Styling
- **Supabase** - PostgreSQL backend for network data
- **React Force Graph** - Canvas-based network visualization
- **Recharts** - Time-series charts

## Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Create `.env` file with your Supabase credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Deployment

Deploys to GitHub Pages via `gh-pages`. Set repository secrets for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

```bash
npm run deploy
```

## Project Structure

- `src/components/` - UI components and graph visualisation
- `src/hooks/` - Data fetching and state management
- `src/utils/` - Supabase queries and graph utilities
- `src/pages/` - Route pages
- `public/` - Static assets
