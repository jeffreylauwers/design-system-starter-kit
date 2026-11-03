import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './StatusBadge.css';

export type StatusBadgeVariant =
  'neutral' | 'positive' | 'negative' | 'warning' | 'info';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Semantische variant die de signaalkleur bepaalt
   * @default 'neutral'
   */
  variant?: StatusBadgeVariant;

  /**
   * Optioneel decoratief icoon vóór de badge-tekst (altijd aria-hidden)
   */
  iconStart?: React.ReactNode;

  /**
   * Badge-tekst (verplicht)
   */
  children: React.ReactNode;
}

/**
 * StatusBadge component
 * Compact label dat een status communiceert met een signaalkleur en optioneel icoon.
 *
 * @example
 * ```tsx
 * // Neutral (default), zonder icoon
 * <StatusBadge>Actief</StatusBadge>
 *
 * // Positive met icoon
 * <StatusBadge variant="positive" iconStart={<Icon name="circle-check" size="sm" aria-hidden />}>
 *   Goedgekeurd
 * </StatusBadge>
 *
 * // Negative met icoon
 * <StatusBadge variant="negative" iconStart={<Icon name="exclamation-circle" size="sm" aria-hidden />}>
 *   Afgewezen
 * </StatusBadge>
 *
 * // Info met icoon
 * <StatusBadge variant="info" iconStart={<Icon name="info-circle" size="sm" aria-hidden />}>
 *   Nieuw
 * </StatusBadge>
 *
 * // Warning met icoon
 * <StatusBadge variant="warning" iconStart={<Icon name="alert-triangle" size="sm" aria-hidden />}>
 *   Let op
 * </StatusBadge>
 * ```
 */
export const StatusBadge = React.forwardRef<HTMLElement, StatusBadgeProps>(
  ({ className, variant = 'neutral', iconStart, children, ...props }, ref) => {
    const classes = classNames(
      'dsn-status-badge',
      variant !== 'neutral' && `dsn-status-badge--${variant}`,
      className
    );

    return (
      <strong ref={ref} className={classes} {...props}>
        {iconStart}
        {children}
      </strong>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
