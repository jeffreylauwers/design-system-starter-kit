import { useState, useRef } from 'react';
import { ColorSwatch } from './ColorSwatch';
import {
  isValidColor,
  oklchToHex,
  parseToOklch,
} from '@dsn-starter-kit/theme-engine';
import type { DisplayFormat } from '../types';
import type { GroupView } from '../model/theme';
import { TOKEN_STEPS, INVERSE_TOKEN_STEPS } from '../types';
import './ColorGroupRow.css';

/** The base color as #rrggbb, for the native color picker. */
function pickerValue(color: string): string {
  const oklch = parseToOklch(color);
  return oklch ? oklchToHex(oklch) : '#000000';
}

interface Props {
  group: GroupView;
  format: DisplayFormat;
  showInverse: boolean;
  onBaseColorChange: (id: string, color: string) => void;
  /** Returns why the name cannot be used, or null when it was renamed. */
  onRename: (id: string, name: string) => string | null;
  onDelete: (id: string) => void;
  /** A group of your own can be renamed and deleted; Start's groups not. */
  canEdit: boolean;
}

export function ColorGroupRow({
  group,
  format,
  showInverse,
  onBaseColorChange,
  onRename,
  onDelete,
  canEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(group.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState(group.baseColor);
  const [colorError, setColorError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Follow the base color when it changes elsewhere (back to Start, a
  // reference that becomes its own color).
  const [shownBase, setShownBase] = useState(group.baseColor);
  if (group.baseColor !== shownBase) {
    setShownBase(group.baseColor);
    setColorInput(group.baseColor);
    setColorError(false);
  }

  function handleNameClick() {
    setEditing(true);
    setTimeout(() => nameRef.current?.select(), 0);
  }

  function handleNameBlur() {
    setEditing(false);
    const trimmed = nameInput.trim();
    const problem = trimmed ? onRename(group.id, trimmed) : null;
    setNameError(problem);
    if (!trimmed || problem) setNameInput(group.name);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') nameRef.current?.blur();
    if (e.key === 'Escape') {
      setNameInput(group.name);
      setEditing(false);
    }
  }

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setColorInput(val);
    if (isValidColor(val)) {
      setColorError(false);
      onBaseColorChange(group.id, val);
    } else {
      setColorError(true);
    }
  }

  function handleColorPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value;
    setColorInput(hex);
    setColorError(false);
    onBaseColorChange(group.id, hex);
  }

  return (
    <div className="color-group-row">
      <div className="color-group-row__header">
        <div className="color-group-row__name-wrap">
          {editing ? (
            <input
              ref={nameRef}
              className="color-group-row__name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
            />
          ) : canEdit ? (
            <button
              className="color-group-row__name"
              onClick={handleNameClick}
              title="Klik om naam te bewerken"
            >
              {group.name}
            </button>
          ) : (
            <span className="color-group-row__name color-group-row__name--fixed">
              {group.name}
            </span>
          )}
          {group.aliasOf && (
            <span className="color-group-row__alias">
              Volgt {group.aliasOf}
            </span>
          )}
          {nameError && (
            <span className="color-group-row__name-error" role="alert">
              {nameError}
            </span>
          )}
        </div>

        <div className="color-group-row__color-input-wrap">
          <input
            type="color"
            className="color-group-row__color-picker"
            value={pickerValue(group.baseColor)}
            onChange={handleColorPickerChange}
            title="Kies basiskleur"
          />
          <input
            type="text"
            className={`color-group-row__color-text ${colorError ? 'color-group-row__color-text--error' : ''}`}
            value={colorInput}
            onChange={handleColorChange}
            placeholder="#000000"
            aria-label={`Basiskleur voor ${group.name}`}
          />
        </div>

        {canEdit && (
          <button
            className="color-group-row__delete"
            onClick={() => onDelete(group.id)}
            aria-label={`Verwijder ${group.name}`}
            title="Verwijder groep"
          >
            ×
          </button>
        )}
      </div>

      <div className="color-group-row__swatches">
        {TOKEN_STEPS.map((step) => (
          <div key={step} className="color-group-row__swatch-wrap">
            <ColorSwatch
              data={group.tokens[step]}
              label={`${group.name} ${step}`}
              format={format}
            />
          </div>
        ))}

        {showInverse &&
          INVERSE_TOKEN_STEPS.map((step) => (
            <div
              key={step}
              className="color-group-row__swatch-wrap color-group-row__swatch-wrap--inverse"
            >
              <ColorSwatch
                data={group.inverseTokens[step]}
                label={`${group.name} ${step}`}
                format={format}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
