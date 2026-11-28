import type { InputHTMLAttributes } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './color-input.css';

export interface ColorInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'size'
> {
  /** Id of the text field; a FormField label points at it. */
  id: string;
  /** The color as typed: any CSS color, such as `#0057b0` or `oklch(…)`. */
  value: string;
  /**
   * The same color as `#rrggbb` for the browser's color picker, which only
   * knows hex. Converting is up to the caller, so this component needs no
   * color library.
   */
  pickerValue: string;
  /** Visually hidden label of the picker, e.g. "Kleurkiezer voor accent-1". */
  pickerLabel: string;
  onChange: (value: string) => void;
  /** Called with `#rrggbb` when a color is picked; defaults to onChange. */
  onPick?: (hex: string) => void;
  invalid?: boolean;
}

/**
 * A color in any CSS format, typed in a text field or picked with the
 * browser's color picker.
 *
 * Candidate component: see README.md.
 */
export function ColorInput({
  id,
  value,
  pickerValue,
  pickerLabel,
  onChange,
  onPick,
  invalid = false,
  disabled,
  className,
  ...props
}: ColorInputProps) {
  const pickerId = `${id}-picker`;
  return (
    <div className={classNames('dsn-color-input', className)}>
      <label htmlFor={pickerId} className="dsn-visually-hidden">
        {pickerLabel}
      </label>
      <input
        id={pickerId}
        type="color"
        className="dsn-color-input__picker"
        value={pickerValue}
        disabled={disabled}
        onChange={(event) => (onPick ?? onChange)(event.target.value)}
      />
      <input
        {...props}
        id={id}
        type="text"
        className="dsn-text-input dsn-color-input__text"
        value={value}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
