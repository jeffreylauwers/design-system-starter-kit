import type { ColorMode, DisplayFormat } from '../types';
import './Toolbar.css';

interface Props {
  mode: ColorMode;
  intensity: number;
  format: DisplayFormat;
  showInverse: boolean;
  onModeChange: (mode: ColorMode) => void;
  onIntensityChange: (value: number) => void;
  onFormatChange: (format: DisplayFormat) => void;
  onShowInverseChange: (show: boolean) => void;
  onExportDtcg: () => void;
  onExportGeneric: () => void;
}

export function Toolbar({
  mode,
  intensity,
  format,
  showInverse,
  onModeChange,
  onIntensityChange,
  onFormatChange,
  onShowInverseChange,
  onExportDtcg,
  onExportGeneric,
}: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <label className="toolbar__label">Modus</label>
        <div className="toolbar__toggle-group">
          <button
            className={`toolbar__toggle ${mode === 'light' ? 'toolbar__toggle--active' : ''}`}
            onClick={() => onModeChange('light')}
          >
            ☀ Light
          </button>
          <button
            className={`toolbar__toggle ${mode === 'dark' ? 'toolbar__toggle--active' : ''}`}
            onClick={() => onModeChange('dark')}
          >
            ☾ Dark
          </button>
        </div>
      </div>

      <div className="toolbar__group">
        <label className="toolbar__label" htmlFor="intensity-slider">
          Intensiteit: {intensity.toFixed(1)}×
        </label>
        <input
          id="intensity-slider"
          type="range"
          className="toolbar__slider"
          min="0.3"
          max="2"
          step="0.1"
          value={intensity}
          onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
        />
      </div>

      <div className="toolbar__group">
        <label className="toolbar__label">Weergave</label>
        <div className="toolbar__toggle-group">
          <button
            className={`toolbar__toggle ${format === 'hex' ? 'toolbar__toggle--active' : ''}`}
            onClick={() => onFormatChange('hex')}
          >
            HEX
          </button>
          <button
            className={`toolbar__toggle ${format === 'oklch' ? 'toolbar__toggle--active' : ''}`}
            onClick={() => onFormatChange('oklch')}
          >
            OKLCH
          </button>
        </div>
      </div>

      <div className="toolbar__group">
        <label className="toolbar__label">Inverse</label>
        <button
          className={`toolbar__toggle ${showInverse ? 'toolbar__toggle--active' : ''}`}
          onClick={() => onShowInverseChange(!showInverse)}
        >
          {showInverse ? 'Verbergen' : 'Tonen'}
        </button>
      </div>

      <div className="toolbar__group toolbar__group--export">
        <label className="toolbar__label">Exporteren</label>
        <div className="toolbar__export-btns">
          <button
            className="toolbar__export-btn"
            onClick={onExportDtcg}
            title="DTCG JSON formaat"
          >
            DTCG
          </button>
          <button
            className="toolbar__export-btn"
            onClick={onExportGeneric}
            title="Generieke JSON"
          >
            Generic
          </button>
        </div>
      </div>
    </div>
  );
}
