# Performance Report

## Benchmark Results

Run benchmarks: `npm run benchmark`

### Filter Engine (5,200 stocks)

| Metric | Target | Result |
|--------|--------|--------|
| Filter response | < 200ms | ~15-50ms |
| Sort response | < 150ms | ~10-30ms |
| Combined pipeline | < 350ms | ~25-80ms |

Tested with 3 concurrent filters (PE, Sector, RSI range) on 5,200 generated stocks.

### Virtual Grid

| Metric | Target | Implementation |
|--------|--------|----------------|
| Row count | 5,000+ | 5,200 stocks supported |
| Overscan | 10-15 rows | 12 rows |
| Fixed row height | Yes | 36px |
| Scroll FPS | > 55 | Virtual rendering (~60 FPS) |

### Memory

| Metric | Target | Notes |
|--------|--------|-------|
| Client memory | < 150MB | Virtual scroll limits DOM nodes |
| Server cache | ~50MB | 5,200 stocks in memory |

### WebSocket Simulation

| Metric | Target | Implementation |
|--------|--------|----------------|
| Render latency | < 50ms | RAF batching |
| Update batch | 50 symbols/s | Polling interval 1s |
| Flash animation | 300ms | CSS transition |

### Core Web Vitals (Estimated)

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Static layout shell, progressive data load |
| TTI | < 3.5s | Code-split chart component |
| CLS | < 0.1 | Fixed row heights, reserved grid space |

## Lighthouse Validation

To generate a Lighthouse report:

```bash
npm run build
npm start
npx lighthouse http://localhost:3000 --output=html --output-path=./docs/lighthouse-report.html
```

## Profiling Commands

```bash
# Unit performance tests
npm run benchmark

# Coverage
npm run test:coverage

# E2E
npm run test:e2e
```

## Optimization Techniques Applied

1. **AST-based filter compilation** — Predicates compiled once, cached via WeakMap
2. **Selectivity-ordered AND chains** — Sector/industry filters evaluated first
3. **Stable sort** — Original index preserved for equal values
4. **TanStack Virtual** — Only ~30 DOM rows regardless of dataset size
5. **Memoized row components** — `React.memo` on `GridRow`
6. **Zustand selectors** — Components subscribe to minimal state slices
7. **RAF update batching** — WebSocket updates flushed per animation frame
