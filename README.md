# Hoa Nam Scanner App

Standalone Mobile Scanner runtime for WMS Hoa Nam. This repository is intentionally separate from `WMS_UIUX_HoaNamv2`, which remains the web UI/UX repository.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5180/ScannerHNApp/`.

## Build and checks

```bash
npm run typecheck
npm test
npm run build
```

The app uses the approved Operational Pro scanner baseline, mobile viewport runtime (360/390/430), mock operational data, and app-contained overlay architecture. API integration is intentionally outside this preview repository.

## Source of separation

All Scanner components, Scanner domain modules, approved assets, baseline snapshots, P00–P10 reports and prompt contracts are copied here. The source web repository is not modified or reset during migration; its working tree remains available as a safety copy until the team verifies the new repository.
