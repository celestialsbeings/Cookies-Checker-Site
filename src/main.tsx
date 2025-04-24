import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorker';

// Performance measurement
const startTime = performance.now();

// Create root and render app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Log render time
  const renderTime = performance.now() - startTime;
  console.log(`Initial render time: ${renderTime.toFixed(2)}ms`);
}

// Register service worker for production
if (import.meta.env.PROD) {
  registerServiceWorker();
}
