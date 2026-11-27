import { useEffect, useMemo, useState } from 'react';
import { PaletteGrid } from './components/PaletteGrid';
import { Toolbar } from './components/Toolbar';
import { DocumentationSection } from './components/DocumentationSection';
import { isValidColor } from '@dsn-starter-kit/theme-engine';
import { exportGeneric, downloadJson } from './engine/export';
import {
  defaultConfig,
  exportTheme,
  groupNameProblem,
  groupViews,
} from './model/theme';
import type { ThemeConfig } from './model/theme';
import { clearSession, loadSession, saveSession } from './model/storage';
import type { ColorMode, DisplayFormat } from './types';
import './App.css';

type Groups = ThemeConfig['colors']['groups'];

function withGroups(config: ThemeConfig, groups: Groups): ThemeConfig {
  return { ...config, colors: { ...config.colors, groups } };
}

/** A name for a new group that is not taken yet: color-1, color-2, … */
function newGroupName(config: ThemeConfig): string {
  for (let index = 1; ; index++) {
    const name = `color-${index}`;
    if (!(name in config.colors.groups)) return name;
  }
}

export function App() {
  // The last session, or Start. Read once, on the first render.
  const [initial] = useState(loadSession);
  const [config, setConfig] = useState<ThemeConfig>(
    () => initial?.config ?? defaultConfig()
  );
  const [mode, setMode] = useState<ColorMode>(initial?.mode ?? 'light');
  const [format, setFormat] = useState<DisplayFormat>(initial?.format ?? 'hex');
  const [showInverse, setShowInverse] = useState(initial?.showInverse ?? false);

  useEffect(() => {
    saveSession({ version: 1, config, mode, format, showInverse });
  }, [config, mode, format, showInverse]);

  const groups = useMemo(() => groupViews(config, mode), [config, mode]);

  function handleIntensityChange(intensity: number) {
    setConfig((prev) => ({ ...prev, colors: { ...prev.colors, intensity } }));
  }

  // Changing the color of a group that refers to another one gives it its
  // own base color: it no longer follows.
  function handleBaseColorChange(name: string, color: string) {
    if (!isValidColor(color)) return;
    setConfig((prev) =>
      withGroups(prev, { ...prev.colors.groups, [name]: { base: color } })
    );
  }

  /** Renames a group of your own; returns why not, or null when it worked. */
  function handleRename(name: string, newName: string): string | null {
    if (newName === name) return null;
    const problem = groupNameProblem(config, newName);
    if (problem) return problem;
    setConfig((prev) =>
      withGroups(
        prev,
        Object.fromEntries(
          Object.entries(prev.colors.groups).map(([key, group]) => [
            key === name ? newName : key,
            group,
          ])
        )
      )
    );
    return null;
  }

  function handleDelete(name: string) {
    setConfig((prev) => {
      const groups = { ...prev.colors.groups };
      delete groups[name];
      return withGroups(prev, groups);
    });
  }

  function handleAddGroup() {
    setConfig((prev) =>
      withGroups(prev, {
        ...prev.colors.groups,
        [newGroupName(prev)]: { base: '#6366f1' },
      })
    );
  }

  function handleReset() {
    clearSession();
    setConfig(defaultConfig());
  }

  function handleExportColors() {
    const file = mode === 'light' ? 'colors-light.json' : 'colors-dark.json';
    downloadJson(exportTheme(config)[file], file);
  }

  function handleExportConfig() {
    downloadJson(exportTheme(config)['theme.config.json'], 'theme.config.json');
  }

  function handleExportGeneric() {
    downloadJson(exportGeneric(groups), 'colors.json');
  }

  return (
    <div className={`app app--${mode}`}>
      <header className="app__header">
        <div className="app__header-inner">
          <h1 className="app__title">DSN Theme Configurator</h1>
          <p className="app__subtitle">
            Genereer een volledig semantisch OKLCH kleurenpalet op basis van een
            basiskleur per groep. Contrast wordt automatisch gecontroleerd
            conform WCAG 2.x. Je begint bij het thema Start.
          </p>
        </div>
      </header>

      <main className="app__main">
        <Toolbar
          mode={mode}
          intensity={config.colors.intensity}
          format={format}
          showInverse={showInverse}
          onModeChange={setMode}
          onIntensityChange={handleIntensityChange}
          onFormatChange={setFormat}
          onShowInverseChange={setShowInverse}
          onExportColors={handleExportColors}
          onExportConfig={handleExportConfig}
          onExportGeneric={handleExportGeneric}
          onReset={handleReset}
        />

        <PaletteGrid
          groups={groups}
          format={format}
          showInverse={showInverse}
          onBaseColorChange={handleBaseColorChange}
          onRename={handleRename}
          onDelete={handleDelete}
          onAddGroup={handleAddGroup}
        />

        <div className="app__legend">
          <div className="app__legend-item">
            <span className="app__legend-badge app__legend-badge--pass">✓</span>
            <span>
              Contrast voldoet aan WCAG-eis (4.5:1 tekst / 3:1 border)
            </span>
          </div>
          <div className="app__legend-item">
            <span className="app__legend-badge app__legend-badge--fail">✗</span>
            <span>Contrast voldoet niet — L wordt automatisch bijgesteld</span>
          </div>
          <div className="app__legend-item">
            <span>Klik op een swatch om de kleurwaarde te kopiëren</span>
          </div>
        </div>

        <DocumentationSection />
      </main>
    </div>
  );
}
