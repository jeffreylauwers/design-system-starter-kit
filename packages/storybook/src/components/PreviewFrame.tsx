import React from 'react';

interface PreviewFrameProps {
  children: React.ReactNode;
}

/**
 * PreviewFrame — wraps a Storybook Story on the docs page with a styled border and
 * a background that uses design token CSS variables so it automatically responds to
 * dark mode and theme switching (just like the individual story canvases do).
 */
export function PreviewFrame({ children }: PreviewFrameProps) {
  return (
    <div
      style={{
        border: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        padding: '32px 24px',
        background: 'var(--dsn-color-neutral-bg-document, #FCFCFC)',
      }}
    >
      {children}
    </div>
  );
}
