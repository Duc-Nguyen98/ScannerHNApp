'use client';

import ScannerPreview from './scanner-preview';
import ScannerAppShell from './scanner-app-shell';

export default function WarrantyScannerApp() {
  return <ScannerAppShell><ScannerPreview /></ScannerAppShell>;
}
