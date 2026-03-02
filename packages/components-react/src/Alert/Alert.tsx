import React from 'react';
import { classNames } from '@dsn/core';
import { Icon } from '../Icon';
import { Heading } from '../Heading';
import './Alert.css';

export type AlertVariant = 'info' | 'positive' | 'negative' | 'warning';

const PREFERRED_ICONS: Record<AlertVariant, string> = {
  info: 'info-circle',
  positive: 'circle-check',
  negative: 'exclamation-circle',
  warning: 'alert-triangle',
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Semantische variant die de signaalkleur bepaalt
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Koptekst van het bericht (verplicht)
   */
  heading: string;

  /**
   * Semantisch heading-niveau — bepaalt het HTML-element (h1–h6)
   * @default 2
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Icoon vóór de heading.
   * - `undefined` (default) — aanbevolen icoon per variant
   * - `null` — geen icoon
   * - `ReactNode` — aangepast icoon
   */
  iconStart?: React.ReactNode;

  /**
   * Optionele body content (tekst, lijst, links, etc.)
   */
  children?: React.ReactNode;
}

/**
 * Alert component
 * Belangrijk bericht dat de gebruiker informeert over de huidige activiteit of toestand.
 *
 * @example
 * ```tsx
 * // Info (default)
 * <Alert heading="Uw aanvraag wordt verwerkt">
 *   Dit kan enkele minuten duren.
 * </Alert>
 *
 * // Positive
 * <Alert variant="positive" heading="Gelukt">
 *   Uw gegevens zijn opgeslagen.
 * </Alert>
 *
 * // Negative
 * <Alert variant="negative" heading="Er is een fout opgetreden">
 *   Controleer uw gegevens en probeer het opnieuw.
 * </Alert>
 *
 * // Warning
 * <Alert variant="warning" heading="Let op">
 *   Uw sessie verloopt over 5 minuten.
 * </Alert>
 *
 * // Zonder icoon
 * <Alert variant="info" heading="Opmerking" iconStart={null}>
 *   Aanvullende informatie.
 * </Alert>
 *
 * // Met aangepast icoon
 * <Alert variant="info" heading="Tip" iconStart={<Icon name="star" aria-hidden />}>
 *   Gebruik de zoekfunctie om snel te navigeren.
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      heading,
      headingLevel = 2,
      iconStart,
      children,
      ...props
    },
    ref
  ) => {
    const noIcon = iconStart === null;

    const resolvedIcon =
      iconStart === undefined ? (
        <Icon
          name={PREFERRED_ICONS[variant] as Parameters<typeof Icon>[0]['name']}
          aria-hidden
        />
      ) : (
        iconStart
      );

    const classes = classNames(
      'dsn-alert',
      variant !== 'info' && `dsn-alert--${variant}`,
      noIcon && 'dsn-alert--no-icon',
      className
    );

    return (
      <div ref={ref} className={classes} role="alert" {...props}>
        {!noIcon && (
          <span className="dsn-alert__icon" aria-hidden>
            {resolvedIcon}
          </span>
        )}
        <Heading
          level={headingLevel}
          appearance="heading-3"
          className="dsn-alert__heading"
        >
          {heading}
        </Heading>
        {children && <div className="dsn-alert__content">{children}</div>}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
