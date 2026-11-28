import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The configurator itself is Start dark, always. It never switches theme or
// mode, so the complete dark configuration on :root is all it needs; the
// class route (css/scoped/* with dsn-theme-start dsn-mode-dark) would give
// the same values. The preview loads its own tokens in its own document.
import '@dsn-starter-kit/design-tokens/css/dark';
import '@dsn-starter-kit/core/css';
import '@dsn-starter-kit/components-react/css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
