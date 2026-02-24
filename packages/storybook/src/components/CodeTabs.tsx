import React, { useState } from 'react';
import { Source } from '@storybook/blocks';

interface CodeTabsProps {
  /** JSX/TSX code snippet for the React tab */
  react: string;
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
 * The tab bar uses design token CSS variables so it responds to dark mode.
 */
export function CodeTabs({ react, html }: CodeTabsProps) {
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
    <div>
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
          <Source code={react} language="tsx" dark />
        ) : (
          <Source code={html} language="html" dark />
        )}
      </div>
    </div>
  );
}
