import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The configurator itself is Start dark, always: the complete dark token
// configuration on :root. The class-scoped files (css/scoped/start-dark) hold
// only the color tokens, and component tokens resolve their var() on :root,
// so they would keep Start light. The preview loads its own tokens in its
// own document.
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
