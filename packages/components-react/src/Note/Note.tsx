import React, { useId } from 'react';
import { classNames } from '@dsn/core';
import { Icon } from '../Icon';
import { Heading } from '../Heading';
import './Note.css';

export type NoteVariant =
  | 'neutral'
  | 'info'
  | 'positive'
  | 'negative'
  | 'warning';
export type NoteAs = 'div' | 'aside' | 'nav' | 'section';

const PREFERRED_ICONS: Record<NoteVariant, string> = {
  neutral: 'info-circle',
  info: 'info-circle',
  positive: 'circle-check',
  negative: 'exclamation-circle',
  warning: 'alert-triangle',
};

export interface NoteProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML-element — ontkoppelt semantiek van visuele stijl
   * @default 'div'
   */
  as?: NoteAs;

  /**
   * Semantische variant die de signaalkleur bepaalt
   * @default 'neutral'
   */
  variant?: NoteVariant;

  /**
   * Optionele heading-tekst (renders als `<Heading appearance="heading-3">`)
   */
  heading?: string;

  /**
   * Semantisch heading-niveau — bepaalt het HTML-element (h1–h6)
   * @default 3
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
   * Body-content: tekst, lijst, links, etc.
   */
  children?: React.ReactNode;
}

/**
 * Note component
 * Visueel uitgelicht bericht voor aanvullende of belangrijke informatie.
 * Passieve tegenhanger van Alert — geen live region, wordt alleen voorgelezen bij navigatie.
 *
 * @example
 * ```tsx
 * // Neutral (default), inline tip
 * <Note heading="Let op">
 *   <Paragraph>Aanvullende informatie over dit onderwerp.</Paragraph>
 * </Note>
 *
 * // Info variant
 * <Note variant="info" heading="Wist je dat...">
 *   <Paragraph>Extra context.</Paragraph>
 * </Note>
 *
 * // Zonder heading — icoon overspant beide rijen
 * <Note variant="warning">
 *   <Paragraph>Dit heeft gevolgen voor uw aanvraag.</Paragraph>
 * </Note>
 *
 * // as="aside" — echt aanvullende content
 * <Note as="aside" variant="info" heading="Achtergrondinformatie">
 *   <Paragraph>Meer context.</Paragraph>
 * </Note>
 *
 * // as="nav" — inhoudsopgave
 * <Note as="nav" variant="neutral" heading="Op deze pagina" headingLevel={2}>
 *   <UnorderedList>
 *     <li><Link href="#sectie-1">Sectie 1</Link></li>
 *   </UnorderedList>
 * </Note>
 *
 * // Icoon weglaten
 * <Note variant="info" heading="Opmerking" iconStart={null}>
 *   <Paragraph>Zonder icoon.</Paragraph>
 * </Note>
 * ```
 */
export const Note = React.forwardRef<HTMLElement, NoteProps>(
  (
    {
      as: As = 'div',
      className,
      variant = 'neutral',
      heading,
      headingLevel = 3,
      iconStart,
      children,
      ...props
    },
    ref
  ) => {
    const headingId = useId();
    const noIcon = iconStart === null;
    const noHeading = !heading;

    const resolvedIcon =
      iconStart === undefined ? (
        <Icon
          name={PREFERRED_ICONS[variant] as Parameters<typeof Icon>[0]['name']}
          size="xl"
          aria-hidden
        />
      ) : (
        iconStart
      );

    const classes = classNames(
      'dsn-note',
      variant !== 'neutral' && `dsn-note--${variant}`,
      noHeading && 'dsn-note--no-heading',
      className
    );

    // For landmark elements with a heading, add aria-labelledby automatically
    const isLandmark = As === 'nav' || As === 'aside' || As === 'section';
    const labelledBy =
      isLandmark && heading && !props['aria-label'] && !props['aria-labelledby']
        ? headingId
        : undefined;

    return (
      <As
        ref={ref as React.Ref<HTMLDivElement>}
        className={classes}
        aria-labelledby={labelledBy}
        {...props}
      >
        {!noIcon && (
          <span className="dsn-note__icon" aria-hidden>
            {resolvedIcon}
          </span>
        )}
        {heading && (
          <Heading
            level={headingLevel}
            appearance="heading-3"
            className="dsn-note__heading"
            id={isLandmark ? headingId : undefined}
          >
            {heading}
          </Heading>
        )}
        {children && <div className="dsn-note__content">{children}</div>}
      </As>
    );
  }
);

Note.displayName = 'Note';
