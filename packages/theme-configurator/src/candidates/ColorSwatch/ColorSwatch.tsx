import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Icon } from '@dsn-starter-kit/components-react';
import './color-swatch.css';

export interface ColorSwatchContrast {
  /** Contrast ratio, e.g. 4.62. */
  ratio: number;
  /** The ratio it must reach, e.g. 4.5 for text or 3 for borders. */
  required: number;
}

export interface ColorSwatchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'value'
> {
  /** The color shown in the chip, any CSS color. */
  color: string;
  /** Name of the color, e.g. `bg-default`. */
  name: string;
  /** The value as text, in the chosen format; this is what gets copied. */
  value: string;
  contrast?: ColorSwatchContrast;
  /** A short remark below the value, e.g. that the color is a fallback. */
  note?: string;
  /** What activating the swatch does, read after its content. */
  actionLabel?: string;
}

const RATIO = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });
const formatRatio = (ratio: number) => RATIO.format(ratio);

/**
 * One color with its name, value and, when given, its contrast. The swatch
 * is a button; the caller decides what activating it does, usually copying
 * the value. Pass and fail are shown with an icon and a word, never with
 * color alone.
 *
 * Candidate component: see README.md.
 */
export function ColorSwatch({
  color,
  name,
  value,
  contrast,
  note,
  actionLabel = 'kopieer',
  className,
  style,
  type = 'button',
  ...props
}: ColorSwatchProps) {
  const pass = contrast ? contrast.ratio >= contrast.required : true;
  const contrastText = contrast
    ? `, contrast ${formatRatio(contrast.ratio)}:1, haalt ${formatRatio(contrast.required)}:1${pass ? '' : ' niet'}`
    : '';

  return (
    <button
      {...props}
      type={type}
      className={classNames('dsn-color-swatch', className)}
      style={{ ...style, '--dsn-color-swatch-color': color } as CSSProperties}
    >
      {/* One sentence as the accessible name, so it does not depend on how a
          browser joins the separate parts. It contains the visible text. */}
      <span className="dsn-visually-hidden">
        {`${name}: ${value}${contrastText}${note ? `, ${note}` : ''}, ${actionLabel}`}
      </span>
      <span className="dsn-color-swatch__chip" aria-hidden="true" />
      <span className="dsn-color-swatch__name" aria-hidden="true">
        {name}
      </span>
      <span className="dsn-color-swatch__value" aria-hidden="true">
        {value}
      </span>
      {contrast && (
        <span
          className={classNames(
            'dsn-color-swatch__contrast',
            !pass && 'dsn-color-swatch__contrast--fail'
          )}
          aria-hidden="true"
        >
          <Icon name={pass ? 'check' : 'alert-triangle'} size="sm" />
          {formatRatio(contrast.ratio)}:1
        </span>
      )}
      {note && (
        <span className="dsn-color-swatch__note" aria-hidden="true">
          {note}
        </span>
      )}
    </button>
  );
}
