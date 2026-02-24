import React, { useState } from 'react';
import { Source } from '@storybook/blocks';
import './CodeTabs.css';

interface CodeTabsProps {
  /**
   * @deprecated — React tab now uses SourceType.DYNAMIC to show live story code
   * that updates with Controls. This prop is kept for backward compatibility but ignored.
   */
  react?: string;
  /** HTML/CSS markup snippet for the HTML/CSS tab */
  html: string;
}

type Tab = 'react' | 'html';

/**
 * CodeTabs — two-tab code viewer shown below PreviewFrame on every doc page.
 * - React tab (default): shows the JSX/TSX snippet
 * - HTML/CSS tab: shows the equivalent vanilla HTML markup
 *
 * Syntax highlighting via Storybook's built-in Source block from @storybook/blocks.
 * The React tab uses Source without explicit type (defaults to AUTO, which resolves to
 * DYNAMIC for stories with args). This shows live story code and updates with Controls.
 * The tab bar uses design token CSS variables so it responds to dark mode.
 */
export function CodeTabs({ html }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('react');

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    borderTop: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
    borderLeft: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
    borderRight: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
    background: 'var(--dsn-color-neutral-bg-default, #F1F1F1)',
    marginBottom: '0',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: `2px solid ${isActive ? 'var(--dsn-link-color, #1d70b8)' : 'transparent'}`,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--dsn-text-font-family-base, sans-serif)',
    fontSize: '13px',
    fontWeight: isActive ? '600' : '400',
    color: isActive
      ? 'var(--dsn-link-color, #1d70b8)'
      : 'var(--dsn-color-neutral-color-document, #1B1B1B)',
    lineHeight: '1.5',
  });

  const codeWrapperStyle: React.CSSProperties = {
    border: '1px solid var(--dsn-color-neutral-border-subtle, #C4C4C4)',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    overflow: 'hidden',
    marginBottom: '24px',
  };

  return (
    <div className="dsn-code-tabs">
      <div style={tabBarStyle}>
        <button
          type="button"
          style={tabButtonStyle(activeTab === 'react')}
          onClick={() => setActiveTab('react')}
          aria-pressed={activeTab === 'react'}
        >
          React
        </button>
        <button
          type="button"
          style={tabButtonStyle(activeTab === 'html')}
          onClick={() => setActiveTab('html')}
          aria-pressed={activeTab === 'html'}
        >
          HTML/CSS
        </button>
      </div>
      <div style={codeWrapperStyle}>
        {activeTab === 'react' ? (
          <Source dark />
        ) : (
          <Source code={html} language="html" dark />
        )}
      </div>
    </div>
  );
}
