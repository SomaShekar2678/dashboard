# APMS — Asset Performance Monitoring System

A standalone industrial asset-health monitoring dashboard prototype built from scratch with React, TypeScript, Vite and Recharts.

## Interface capabilities
- Enterprise overview with plant-level performance and asset condition summaries
- Plant monitoring and searchable/filterable asset register
- Asset health indicators, temperature, vibration, remaining useful life (RUL) and failure-risk views
- AI prediction and condition-alert screens
- Maintenance work-order creation and completion interactions
- Analytics, sensor trend visualisation, CSV export, theme switching and responsive navigation
- Command palette via Ctrl+K / Cmd+K

## Run locally
Requires Node.js 20+.

```bash
npm install
npm run dev -- --port 8095
```

## Production build
```bash
npm run build
```

## Data and integration status
This repository currently contains a **frontend prototype only**. All asset readings, plant KPIs, failure probabilities, RUL values, alerts and model-related displays are illustrative demo data. Sensor trend series are synthetic. No live PLC/SCADA/historian/IoT connection, backend API, database, trained inference service or model registry is configured. Work orders are held in browser memory and are not persisted. Do not interpret the displayed values as validated operational or model outputs.

The UI is an original React/TypeScript implementation. The supplied HTML reference informed interaction patterns and visual direction; its source was not copied into the application.
