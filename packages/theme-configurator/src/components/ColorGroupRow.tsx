import { useState, useRef } from 'react';
import { ColorSwatch } from './ColorSwatch';
import { isValidColor } from '@dsn-starter-kit/theme-engine';
import type { ColorGroup, DisplayFormat } from '../types';
import { TOKEN_STEPS, INVERSE_TOKEN_STEPS } from '../types';
import './ColorGroupRow.css';

interface Props {
  group: ColorGroup;
  format: DisplayFormat;
  showInverse: boolean;
  onBaseColorChange: (id: string, color: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function ColorGroupRow({
  group,
  format,
  showInverse,
  onBaseColorChange,
  onRename,
  onDelete,
  canDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(group.name);
  const [colorInput, setColorInput] = useState(group.baseColor);
  const [colorError, setColorError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleNameClick() {
    setEditing(true);
    setTimeout(() => nameRef.current?.select(), 0);
  }

  function handleNameBlur() {
    setEditing(false);
    const trimmed = nameInput.trim();
    if (trimmed) {
      onRename(group.id, trimmed);
    } else {
      setNameInput(group.name);
    }
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
          ) : (
            <button
              className="color-group-row__name"
              onClick={handleNameClick}
              title="Klik om naam te bewerken"
            >
              {group.name}
            </button>
          )}
        </div>

        <div className="color-group-row__color-input-wrap">
          <input
            type="color"
            className="color-group-row__color-picker"
            value={
              group.baseColor.startsWith('#') ? group.baseColor : '#000000'
            }
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

        {canDelete && (
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
