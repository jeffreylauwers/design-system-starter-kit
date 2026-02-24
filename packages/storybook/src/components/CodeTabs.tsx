import React, { useState } from 'react';
import { Source } from '@storybook/blocks';
import './CodeTabs.css';

interface CodeTabsProps {
  /**
   * Story export to show in the React tab. Required for live code that updates with Controls.
   * Pass the Default story export from the component's stories file:
   * `of={ButtonStories.Default}`
   *
   * The Source block subscribes to STORY_ARGS_UPDATED so the code updates automatically
   * when the user changes props via the Controls panel.
   */
  of: unknown;
  /**
   * @deprecated — kept for backward compatibility with existing .docs.mdx files.
   * No longer used. The React tab reads live code from the story referenced by `of`.
   */
  react?: string;
  /** HTML/CSS markup snippet for the HTML/CSS tab */
  html: string;
}

type Tab = 'react' | 'html';

/**
 * CodeTabs — two-tab code viewer shown below PreviewFrame on every doc page.
 * - React tab (default): shows live story code via `Source of={story}`, updates with Controls
 * - HTML/CSS tab: shows the equivalent vanilla HTML markup (static)
 *
 * Syntax highlighting via Storybook's built-in Source block from @storybook/blocks.
 * The tab bar uses design token CSS variables so it responds to dark mode.
 */
export function CodeTabs({ of: storyRef, html }: CodeTabsProps) {
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
          // Source with explicit `of` subscribes to STORY_ARGS_UPDATED and
          // updates the displayed code when the user changes Controls.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Source of={storyRef as any} dark />
        ) : (
          <Source code={html} language="html" dark />
        )}
      </div>
    </div>
  );
}
