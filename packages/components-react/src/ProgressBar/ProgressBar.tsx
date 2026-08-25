import React, { useId } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './ProgressBar.css';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visueel verborgen label dat de voortgangsbalk beschrijft voor screenreaders.
   * Altijd vereist — gekoppeld via `<label for>` aan het `<progress>`-element.
   */
  label: string;

  /**
   * Huidige voortgang (0 t/m max).
   */
  value: number;

  /**
   * Maximale waarde. Percentage wordt berekend als Math.round((value / max) * 100).
   * @default 100
   */
  max?: number;

  /**
   * Optionele beschrijvende tekst onder de balk.
   */
  description?: React.ReactNode;

  /**
   * ID voor het `<progress>`-element en de bijbehorende `<label>`.
   * Automatisch gegenereerd via useId() indien weggelaten.
   */
  id?: string;

  /**
   * Verbergt het zichtbare percentage-getal. Gebruik dit voor decoratief gebruik
   * in combinatie met aria-hidden="true" op de component.
   */
  hideValue?: boolean;
}

/**
 * ProgressBar component
 * Horizontale voortgangsbalk voor bepaalde wachttijden.
 *
 * Het native <progress>-element biedt impliciete role="progressbar" met
 * aria-valuenow, aria-valuemin en aria-valuemax. Een visueel verborgen
 * <label> koppelt de toegankelijke naam via for/id.
 *
 * @example
 * ```tsx
 * // Basis
 * <ProgressBar label="Bestand uploaden" value={35} />
 *
 * // Met beschrijving
 * <ProgressBar
 *   label="Bestand uploaden"
 *   value={35}
 *   description="Bestand wordt geüpload, even geduld..."
 * />
 *
 * // Stappen (stap 3 van 7)
 * <ProgressBar label="Stap voortgang" value={3} max={7} />
 * ```
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      label,
      value,
      max = 100,
      description,
      hideValue,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const progressId = id ?? generatedId;
    const descriptionId = description ? `${progressId}-description` : undefined;
    const percentage = Math.round((value / max) * 100);

    return (
      <div
        ref={ref}
        className={classNames('dsn-progress-bar', className)}
        {...props}
      >
        <label className="dsn-visually-hidden" htmlFor={progressId}>
          {label}
        </label>
        {!hideValue && (
          <div className="dsn-progress-bar__header">
            <p
              className="dsn-paragraph dsn-progress-bar__percentage"
              aria-hidden="true"
            >
              {percentage}%
            </p>
          </div>
        )}
        <progress
          id={progressId}
          className="dsn-progress-bar__bar"
          value={value}
          max={max}
          aria-describedby={descriptionId}
        >
          {percentage}%
        </progress>
        {description && (
          <p
            id={descriptionId}
            className="dsn-paragraph dsn-progress-bar__description"
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
