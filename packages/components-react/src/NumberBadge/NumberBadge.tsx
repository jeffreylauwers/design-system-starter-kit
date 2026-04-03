import React from 'react';
import { classNames } from '@dsn/core';
import './NumberBadge.css';

export type NumberBadgeVariant =
  | 'negative'
  | 'positive'
  | 'warning'
  | 'info'
  | 'neutral';

export interface NumberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Signaalkleur van de badge
   * @default 'negative'
   */
  variant?: NumberBadgeVariant;

  /**
   * Als `children` als getal groter is dan `maxCount`, wordt `{maxCount}+` getoond.
   * Heeft geen effect als `children` geen getal is.
   */
  maxCount?: number;
}

/**
 * NumberBadge component
 * Compact inline-element dat een getal toont — zoals het aantal ongelezen berichten
 * of openstaande taken. Geplaatst binnen een Button of Menu-item, naast het label.
 *
 * Altijd aria-hidden="true" — context via dsn-visually-hidden in de parent.
 *
 * @example
 * ```tsx
 * // Basis gebruik — inline in een Button
 * <Button variant="subtle" iconStart={<Icon name="inbox" aria-hidden />}>
 *   Inbox
 *   <NumberBadge variant="negative">5</NumberBadge>
 * </Button>
 *
 * // Afgekapt getal — toont "99+" als count > 99
 * <Button variant="subtle" iconStart={<Icon name="inbox" aria-hidden />}>
 *   <span>
 *     Inbox
 *     <span className="dsn-visually-hidden">, 128 ongelezen berichten</span>
 *   </span>
 *   <NumberBadge variant="negative" maxCount={99}>128</NumberBadge>
 * </Button>
 * ```
 */
export const NumberBadge = React.forwardRef<HTMLSpanElement, NumberBadgeProps>(
  ({ className, variant = 'negative', maxCount, children, ...props }, ref) => {
    const classes = classNames(
      'dsn-number-badge',
      `dsn-number-badge--${variant}`,
      className
    );

    let displayValue: React.ReactNode = children;
    if (maxCount !== undefined) {
      const numeric =
        typeof children === 'number'
          ? children
          : typeof children === 'string' && /^\d+$/.test(children)
            ? parseInt(children, 10)
            : null;
      if (numeric !== null && numeric > maxCount) {
        displayValue = `${maxCount}+`;
      }
    }

    return (
      <span ref={ref} className={classes} aria-hidden="true" {...props}>
        {displayValue}
      </span>
    );
  }
);

NumberBadge.displayName = 'NumberBadge';
