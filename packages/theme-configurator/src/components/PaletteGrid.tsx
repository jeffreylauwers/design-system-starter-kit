import { ColorGroupRow } from './ColorGroupRow';
import type { ColorGroup, DisplayFormat } from '../types';
import { TOKEN_STEPS, INVERSE_TOKEN_STEPS } from '../types';
import './PaletteGrid.css';

const COLUMN_LABELS: Record<string, string> = {
  'bg-document': 'bg-document',
  'bg-elevated': 'bg-elevated',
  'bg-subtle': 'bg-subtle',
  'bg-default': 'bg-default',
  'bg-hover': 'bg-hover',
  'bg-active': 'bg-active',
  'border-subtle': 'border-subtle',
  'border-default': 'border-default',
  'border-hover': 'border-hover',
  'border-active': 'border-active',
  'color-subtle': 'color-subtle',
  'color-default': 'color-default',
  'color-hover': 'color-hover',
  'color-active': 'color-active',
  'color-document': 'color-document',
  'inverse-bg-document': 'inv-bg-document',
  'inverse-bg-elevated': 'inv-bg-elevated',
  'inverse-bg-subtle': 'inv-bg-subtle',
  'inverse-bg-default': 'inv-bg-default',
  'inverse-bg-hover': 'inv-bg-hover',
  'inverse-bg-active': 'inv-bg-active',
  'inverse-border-subtle': 'inv-border-subtle',
  'inverse-border-default': 'inv-border-default',
  'inverse-border-hover': 'inv-border-hover',
  'inverse-border-active': 'inv-border-active',
  'inverse-color-subtle': 'inv-color-subtle',
  'inverse-color-default': 'inv-color-default',
  'inverse-color-hover': 'inv-color-hover',
  'inverse-color-active': 'inv-color-active',
  'inverse-color-document': 'inv-color-document',
};

interface Props {
  groups: ColorGroup[];
  format: DisplayFormat;
  showInverse: boolean;
  onBaseColorChange: (id: string, color: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddGroup: () => void;
}

export function PaletteGrid({
  groups,
  format,
  showInverse,
  onBaseColorChange,
  onRename,
  onDelete,
  onAddGroup,
}: Props) {
  const visibleSteps = showInverse
    ? [...TOKEN_STEPS, ...INVERSE_TOKEN_STEPS]
    : TOKEN_STEPS;

  const totalCols = 1 + visibleSteps.length;

  return (
    <div className="palette-grid-wrap">
      <div
        className="palette-grid"
        style={{
          gridTemplateColumns: `220px repeat(${visibleSteps.length}, 160px)`,
        }}
      >
        {/* Row 1: Track labels (bovenste sticky rij) */}
        <div className="palette-grid__track-spacer" />
        <div
          className="palette-grid__track-label"
          style={{ gridColumn: '2 / 8' }}
        >
          Backgrounds
        </div>
        <div
          className="palette-grid__track-label"
          style={{ gridColumn: '8 / 12' }}
        >
          Borders
        </div>
        <div
          className="palette-grid__track-label"
          style={{ gridColumn: '12 / 17' }}
        >
          Colors
        </div>
        {showInverse && (
          <>
            <div
              className="palette-grid__track-label palette-grid__track-label--inverse"
              style={{ gridColumn: '17 / 23' }}
            >
              Inverse Backgrounds
            </div>
            <div
              className="palette-grid__track-label palette-grid__track-label--inverse"
              style={{ gridColumn: '23 / 27' }}
            >
              Inverse Borders
            </div>
            <div
              className="palette-grid__track-label palette-grid__track-label--inverse"
              style={{ gridColumn: '27 / 32' }}
            >
              Inverse Colors
            </div>
          </>
        )}

        {/* Row 2: Kolomheaders */}
        <div className="palette-grid__header palette-grid__header--sticky">
          <span className="palette-grid__header-label">Kleurgroep</span>
        </div>

        {TOKEN_STEPS.map((step) => (
          <div key={step} className="palette-grid__header">
            <span className="palette-grid__header-label">
              {COLUMN_LABELS[step]}
            </span>
          </div>
        ))}

        {showInverse &&
          INVERSE_TOKEN_STEPS.map((step) => (
            <div
              key={step}
              className="palette-grid__header palette-grid__header--inverse"
            >
              <span className="palette-grid__header-label">
                {COLUMN_LABELS[step]}
              </span>
            </div>
          ))}

        {/* Color group rows */}
        {groups.map((group) => (
          <ColorGroupRow
            key={group.id}
            group={group}
            format={format}
            showInverse={showInverse}
            onBaseColorChange={onBaseColorChange}
            onRename={onRename}
            onDelete={onDelete}
            canDelete={groups.length > 1}
          />
        ))}

        {/* Add row */}
        <div
          className="palette-grid__add-row"
          style={{ gridColumn: `1 / ${totalCols + 1}` }}
        >
          <button className="palette-grid__add-btn" onClick={onAddGroup}>
            + Kleurgroep toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
