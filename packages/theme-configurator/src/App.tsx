import { useEffect, useMemo, useState } from 'react';
import { Heading, Note, Paragraph } from '@dsn-starter-kit/components-react';
import { isValidColor } from '@dsn-starter-kit/theme-engine';
import { SegmentedControl } from './candidates/SegmentedControl/SegmentedControl';
import { Tabs } from './candidates/Tabs/Tabs';
import { exportGeneric, downloadJson } from './engine/export';
import {
  defaultConfig,
  exportTheme,
  groupNameProblem,
  groupViews,
} from './model/theme';
import type { ThemeConfig } from './model/theme';
import { clearSession, loadSession, saveSession } from './model/storage';
import { AboutSection } from './panel/AboutSection';
import { ColorPanel } from './panel/ColorPanel';
import type { DisplayFormat } from './panel/GroupEditor';
import { ExportSection } from './panel/ExportSection';
import { copyText } from './panel/copy';
import { Preview } from './preview/Preview';
import type { ColorMode } from './types';
import './App.css';

type Groups = ThemeConfig['colors']['groups'];
type View = 'settings' | 'preview';

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

function Upcoming({ children }: { children: string }) {
  return (
    <Note variant="info" heading="Komt binnenkort" headingLevel={3}>
      <Paragraph>{children}</Paragraph>
    </Note>
  );
}

/**
 * The theme configurator: settings on the left, the preview on the right;
 * on a small screen one of the two, with a switch at the top. The
 * configurator itself is always Start dark (see main.tsx); only the preview
 * shows the theme being configured.
 */
export function App() {
  // The last session, or Start. Read once, on the first render.
  const [initial] = useState(loadSession);
  const [config, setConfig] = useState<ThemeConfig>(
    () => initial?.config ?? defaultConfig()
  );
  const [mode, setMode] = useState<ColorMode>(initial?.mode ?? 'light');
  const [format, setFormat] = useState<DisplayFormat>(initial?.format ?? 'hex');
  const [showInverse, setShowInverse] = useState(initial?.showInverse ?? false);
  const [view, setView] = useState<View>('settings');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    saveSession({ version: 1, config, mode, format, showInverse });
  }, [config, mode, format, showInverse]);

  const groups = useMemo(() => groupViews(config, mode), [config, mode]);

  /** Says something through the live region, also when it is the same. */
  function announce(message: string) {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(message), 50);
  }

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
    announce(`Groep ${name} heet nu ${newName}`);
    return null;
  }

  function handleDelete(name: string) {
    setConfig((prev) => {
      const groups = { ...prev.colors.groups };
      delete groups[name];
      return withGroups(prev, groups);
    });
    announce(`Groep ${name} verwijderd`);
  }

  function handleAddGroup() {
    const name = newGroupName(config);
    setConfig((prev) =>
      withGroups(prev, { ...prev.colors.groups, [name]: { base: '#6366f1' } })
    );
    announce(`Groep ${name} toegevoegd onderaan de kleurgroepen`);
  }

  function handleCopy(value: string) {
    copyText(value)
      .then(() => announce(`Gekopieerd: ${value}`))
      .catch(() => announce('Kopiëren is niet gelukt'));
  }

  function handleReset() {
    clearSession();
    setConfig(defaultConfig());
    announce('Alle instellingen staan weer op Start');
  }

  const files = () => exportTheme(config);

  return (
    <div className="tc-app" data-view={view}>
      <header className="tc-header">
        <Heading level={1} appearance="heading-4">
          Theme configurator
        </Heading>
        <SegmentedControl<View>
          className="tc-view-switch"
          legend="Weergave"
          hideLegend
          options={[
            { value: 'settings', label: 'Instellen' },
            { value: 'preview', label: 'Voorbeeld' },
          ]}
          value={view}
          onChange={setView}
        />
      </header>

      <main className="tc-main">
        <section className="tc-panel" aria-labelledby="panel-heading">
          <Heading level={2} id="panel-heading" className="dsn-visually-hidden">
            Instellen
          </Heading>
          <div className="tc-panel__content">
            <Tabs
              label="Onderdelen van het thema"
              tabs={[
                {
                  id: 'color',
                  label: 'Kleur',
                  content: (
                    <ColorPanel
                      groups={groups}
                      mode={mode}
                      intensity={config.colors.intensity}
                      format={format}
                      showInverse={showInverse}
                      onIntensityChange={handleIntensityChange}
                      onFormatChange={setFormat}
                      onShowInverseChange={setShowInverse}
                      onBaseColorChange={handleBaseColorChange}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onAddGroup={handleAddGroup}
                      onCopy={handleCopy}
                    />
                  ),
                },
                {
                  id: 'typography',
                  label: 'Typografie',
                  content: (
                    <Upcoming>
                      Lettertypen en lettergroottes instellen.
                    </Upcoming>
                  ),
                },
                {
                  id: 'space',
                  label: 'Ruimte',
                  content: <Upcoming>De ruimteschaal instellen.</Upcoming>,
                },
                {
                  id: 'shape',
                  label: 'Vorm',
                  content: (
                    <Upcoming>Hoekafronding en lijndiktes instellen.</Upcoming>
                  ),
                },
                {
                  id: 'shadow',
                  label: 'Schaduw',
                  content: <Upcoming>Schaduwen instellen.</Upcoming>,
                },
              ]}
            />
            <ExportSection
              onExportConfig={() =>
                downloadJson(files()['theme.config.json'], 'theme.config.json')
              }
              onExportColors={(exportMode) => {
                const file = `colors-${exportMode}.json` as const;
                downloadJson(files()[file], file);
              }}
              onExportGeneric={() =>
                downloadJson(exportGeneric(groups), 'colors.json')
              }
              onReset={handleReset}
            />
            <AboutSection />
          </div>
        </section>

        <section className="tc-preview" aria-labelledby="preview-heading">
          <Heading
            level={2}
            id="preview-heading"
            className="dsn-visually-hidden"
          >
            Voorbeeld
          </Heading>
          <Preview config={config} mode={mode} onModeChange={setMode} />
        </section>
      </main>

      <div role="status" className="dsn-visually-hidden">
        {announcement}
      </div>
    </div>
  );
}
