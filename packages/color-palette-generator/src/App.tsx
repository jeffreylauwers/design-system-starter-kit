import { useState, useCallback } from 'react';
import { PaletteGrid } from './components/PaletteGrid';
import { Toolbar } from './components/Toolbar';
import { DocumentationSection } from './components/DocumentationSection';
import { parseToOklch } from './engine/oklch';
import { buildColorGroup } from './engine/palette';
import { exportDtcg, exportGeneric, downloadJson } from './engine/export';
import type { ColorGroup, ColorMode, DisplayFormat } from './types';
import { DEFAULT_GROUP_NAMES, DEFAULT_BASE_COLORS } from './types';
import './App.css';

let nextId = DEFAULT_GROUP_NAMES.length + 1;

function createDefaultGroups(mode: ColorMode, intensity: number): ColorGroup[] {
  return DEFAULT_GROUP_NAMES.map((name) => {
    const baseColor = DEFAULT_BASE_COLORS[name] ?? '#868686';
    const oklch = parseToOklch(baseColor);
    if (!oklch) throw new Error(`Invalid default color for ${name}`);
    return buildColorGroup(name, name, baseColor, oklch, mode, intensity);
  });
}

export function App() {
  const [mode, setMode] = useState<ColorMode>('light');
  const [intensity, setIntensity] = useState(1);
  const [format, setFormat] = useState<DisplayFormat>('hex');
  const [showInverse, setShowInverse] = useState(false);
  const [groups, setGroups] = useState<ColorGroup[]>(() =>
    createDefaultGroups('light', 1)
  );

  function rebuildGroups(
    current: ColorGroup[],
    newMode: ColorMode,
    newIntensity: number
  ): ColorGroup[] {
    return current.map((g) => {
      const oklch = parseToOklch(g.baseColor);
      if (!oklch) return g;
      return buildColorGroup(
        g.id,
        g.name,
        g.baseColor,
        oklch,
        newMode,
        newIntensity
      );
    });
  }

  function handleModeChange(newMode: ColorMode) {
    setMode(newMode);
    setGroups((prev) => rebuildGroups(prev, newMode, intensity));
  }

  function handleIntensityChange(newIntensity: number) {
    setIntensity(newIntensity);
    setGroups((prev) => rebuildGroups(prev, mode, newIntensity));
  }

  const handleBaseColorChange = useCallback(
    (id: string, color: string) => {
      const oklch = parseToOklch(color);
      if (!oklch) return;
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id
            ? buildColorGroup(g.id, g.name, color, oklch, mode, intensity)
            : g
        )
      );
    },
    [mode, intensity]
  );

  const handleRename = useCallback((id: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  function handleAddGroup() {
    const id = `custom-${nextId++}`;
    const baseColor = '#6366f1';
    const oklch = parseToOklch(baseColor);
    if (!oklch) return;
    const group = buildColorGroup(
      id,
      `color-${nextId}`,
      baseColor,
      oklch,
      mode,
      intensity
    );
    setGroups((prev) => [...prev, group]);
  }

  function handleExportDtcg() {
    const filename =
      mode === 'light' ? 'colors-light.json' : 'colors-dark.json';
    downloadJson(exportDtcg(groups, format), filename);
  }

  function handleExportGeneric() {
    downloadJson(exportGeneric(groups), 'colors.json');
  }

  return (
    <div className={`app app--${mode}`}>
      <header className="app__header">
        <div className="app__header-inner">
          <h1 className="app__title">DSN Color Palette Generator</h1>
          <p className="app__subtitle">
            Genereer een volledig semantisch OKLCH kleurenpalet op basis van een
            basiskleur per groep. Contrast wordt automatisch gecontroleerd
            conform WCAG 2.x.
          </p>
        </div>
      </header>

      <main className="app__main">
        <Toolbar
          mode={mode}
          intensity={intensity}
          format={format}
          showInverse={showInverse}
          onModeChange={handleModeChange}
          onIntensityChange={handleIntensityChange}
          onFormatChange={setFormat}
          onShowInverseChange={setShowInverse}
          onExportDtcg={handleExportDtcg}
          onExportGeneric={handleExportGeneric}
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
