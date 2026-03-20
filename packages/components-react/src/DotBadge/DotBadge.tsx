import React from 'react';
import { classNames } from '@dsn/core';
import './DotBadge.css';

export type DotBadgeVariant =
  | 'negative'
  | 'positive'
  | 'warning'
  | 'info'
  | 'neutral';

export interface DotBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Signaalkleur van de stip
   * @default 'negative'
   */
  variant?: DotBadgeVariant;

  /**
   * Voegt een pulserend ring-effect toe om extra aandacht te trekken
   * @default false
   */
  pulse?: boolean;
}

/**
 * DotBadge component
 * Kleine gekleurde stip die bij een Button of Link wordt geplaatst om
 * zonder label of getal de aandacht te trekken bij een statuswijziging.
 *
 * Altijd aria-hidden="true" — context via dsn-visually-hidden in de parent.
 * Parent-wrapper heeft position: relative nodig.
 *
 * @example
 * ```tsx
 * // Basis gebruik — negatieve dot bij een icon-only Button
 * <div style={{ position: 'relative', display: 'inline-flex' }}>
 *   <Button variant="subtle" iconOnly iconStart={<Icon name="inbox" aria-hidden />}>
 *     Inbox
 *     <span className="dsn-visually-hidden">, 3 ongelezen berichten</span>
 *   </Button>
 *   <DotBadge variant="negative" />
 * </div>
 *
 * // Met pulse-effect voor urgente statuswijzigingen
 * <DotBadge variant="negative" pulse />
 * ```
 */
export const DotBadge = React.forwardRef<HTMLSpanElement, DotBadgeProps>(
  ({ className, variant = 'negative', pulse = false, ...props }, ref) => {
    const classes = classNames(
      'dsn-dot-badge',
      `dsn-dot-badge--${variant}`,
      pulse && 'dsn-dot-badge--pulse',
      className
    );

    return <span ref={ref} className={classes} aria-hidden="true" {...props} />;
  }
);

DotBadge.displayName = 'DotBadge';
