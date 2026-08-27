import React, { useState, useEffect } from 'react';

import { fromConfigName, getTokenLoader, toConfigName } from '../token-loader';

interface TokenControlsProps {
  onRefresh?: () => void;
}

export function TokenControls({ onRefresh }: TokenControlsProps) {
  const [theme, setTheme] = useState('start');
  const [mode, setMode] = useState('light');
  const [projectType, setProjectType] = useState('default');

  // Load current values on mount
  useEffect(() => {
    const currentConfig = getTokenLoader()?.getCurrentConfigName();
    if (!currentConfig) return;

    const current = fromConfigName(currentConfig);
    setTheme(current.theme);
    setMode(current.mode);
    setProjectType(current.projectType);
  }, []);

  const applyTokens = (
    newTheme: string,
    newMode: string,
    newProjectType: string
  ) => {
    // Het laden en injecteren gebeurt in de loader uit preview-head.html; die
    // dispatcht ook zelf 'storybook-globals-updated' voor de TokenTables.
    const loader = getTokenLoader();
    if (!loader) return;

    void loader
      .load(toConfigName(newTheme, newMode, newProjectType))
      .then(() => {
        loader.applyBodyClasses(newTheme, newMode, newProjectType);

        if (onRefresh) {
          // Use multiple delays to catch all updates
          setTimeout(onRefresh, 50);
          setTimeout(onRefresh, 150);
          setTimeout(onRefresh, 300);
        }
      });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    applyTokens(newTheme, mode, projectType);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value;
    setMode(newMode);
    applyTokens(theme, newMode, projectType);
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectType = e.target.value;
    setProjectType(newProjectType);
    applyTokens(theme, mode, newProjectType);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        background: 'var(--dsn-color-neutral-bg-subtle, #f6f6f6)',
        borderRadius: '8px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="theme-select"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--dsn-color-neutral-color-subtle, #666)',
          }}
        >
          Theme
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={handleThemeChange}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border:
              '1px solid var(--dsn-color-neutral-border-default, #868686)',
            background: 'var(--dsn-color-neutral-bg-document, #fff)',
            fontSize: '14px',
            fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
            cursor: 'pointer',
          }}
        >
          <option value="start">Start</option>
          <option value="wireframe">Wireframe</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="mode-select"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--dsn-color-neutral-color-subtle, #666)',
          }}
        >
          Mode
        </label>
        <select
          id="mode-select"
          value={mode}
          onChange={handleModeChange}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border:
              '1px solid var(--dsn-color-neutral-border-default, #868686)',
            background: 'var(--dsn-color-neutral-bg-document, #fff)',
            fontSize: '14px',
            fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
            cursor: 'pointer',
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="project-type-select"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--dsn-color-neutral-color-subtle, #666)',
          }}
        >
          Project Type
        </label>
        <select
          id="project-type-select"
          value={projectType}
          onChange={handleProjectTypeChange}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border:
              '1px solid var(--dsn-color-neutral-border-default, #868686)',
            background: 'var(--dsn-color-neutral-bg-document, #fff)',
            fontSize: '14px',
            fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
            cursor: 'pointer',
          }}
        >
          <option value="default">Default</option>
          <option value="information-dense">Information Dense</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          marginLeft: 'auto',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--dsn-color-neutral-color-subtle, #666)',
            fontFamily: 'var(--dsn-text-font-family-default, sans-serif)',
          }}
        >
          Select a configuration to see token values update below
        </p>
      </div>
    </div>
  );
}
