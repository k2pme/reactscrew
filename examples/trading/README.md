# Trading Example

Purpose:
- multi-view trading dashboard
- full-page realtime candlestick view with `lightweight-charts`
- asset selector and zoom
- timed batch refreshes and simulated micro-ticks
- workflow-driven alert generation
- visual price direction + optional audio signal

Public data sources used:
- Frankfurter for fiat FX rates (`EUR/USD`, `USD/EUR`)
- CoinGecko keyless public API for crypto spot prices (`BTC`, `ETH`, `SOL`, `ADA`)

Implementation note:
- the dashboard mixes public seed data with local simulated ticks so the UI keeps moving between remote pulls without depending on a paid realtime feed.

Run:
- `DEMO=trading npm run demo`

Files:
- [trading/src/index.tsx](/home/clodlin/reactscrew/examples/trading/src/index.tsx)
- [trading/src/App.tsx](/home/clodlin/reactscrew/examples/trading/src/App.tsx)
- [trading/src/marketApi.ts](/home/clodlin/reactscrew/examples/trading/src/marketApi.ts)
