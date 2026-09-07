import React from 'react';
import { Body } from '@dsn-starter-kit/components-react';

interface PreviewFrameProps {
  children: React.ReactNode;
}

/**
 * PreviewFrame — wraps a Storybook Story on the docs page with a styled border and
 * a background that uses design token CSS variables so it automatically responds to
 * dark mode and theme switching (just like the individual story canvases do).
 *
 * De achtergrond komt van het Body-component. Eerder stond hier een kale
 * `className="dsn-body"`, maar dan laadt body.css niet mee in de docs-chunk:
 * de frame bleef doorzichtig en wisselde dus niet mee met dark mode.
 */
export function PreviewFrame({ children }: PreviewFrameProps) {
  return (
    <Body
      className="sb-unstyled"
      style={{
        border: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        padding: '32px 24px',
      }}
    >
      {children}
    </Body>
  );
}
