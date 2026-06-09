# StockScreener

Production-grade real-time stock screener with 5,200+ stocks, advanced filtering, virtual scrolling, and interactive charts.

## Features

- **5,200+ stocks** with realistic fundamentals and technical indicators
- **32+ filter fields** with AST-based filter engine (< 200ms)
- **Virtual scrolling** data grid (TanStack Table + Virtual)
- **Real-time price updates** via WebSocket simulation (GBM)
- **Interactive candlestick charts** with SMA, EMA, Bollinger, RSI, Volume
- **Watchlist** with persistent storage
- **Accessible** — ARIA grid, keyboard navigation, high contrast mode

## Tech Stack

- React 18 / Next.js 14 App Router / TypeScript (strict)
- Zustand / TanStack Query / TanStack Table / TanStack Virtual
- TailwindCSS / Lightweight Charts
- Vitest / Playwright

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run benchmark` | Performance benchmarks |

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + API)
├── components/    # UI components (grid, filters, charts)
├── hooks/         # Custom hooks (data, filter, websocket)
├── lib/           # Business logic (filter engine, indicators, data)
├── stores/        # Zustand state management
└── types/         # TypeScript definitions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | All stocks (5200+) |
| GET | `/api/stocks/:symbol` | Stock detail |
| GET | `/api/stocks/:symbol/history` | OHLCV history |
| GET | `/api/stocks/:symbol/fundamentals` | Fundamentals |
| GET/POST | `/api/filters/presets` | Filter presets |
| GET | `/api/sectors` | Sector list |
| GET | `/api/indices` | Index list |
| GET | `/api/prices/updates` | Real-time price batch |

All responses use the envelope: `{ success, data, meta?, error? }`

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect the repository to [Vercel](https://vercel.com) for automatic deployments.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Requirements Matrix](docs/REQUIREMENTS.md)
- [Performance Report](docs/PERFORMANCE_REPORT.md)

## Performance Targets

| Metric | Target | Achieved |
|--------|--------|----------|
| Filter (5200 stocks) | < 200ms | ~15-50ms |
| Sort (5200 stocks) | < 150ms | ~10-30ms |
| Test coverage (lib+stores) | > 70% | ~88% lines |

