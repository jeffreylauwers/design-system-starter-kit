import React from 'react';
import { classNames } from '@dsn/core';
import './Backdrop.css';

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Schakelt het blur-filter in of uit.
   * Gebruik `false` als fallback voor omgevingen zonder backdrop-filter support.
   * @default true
   */
  blur?: boolean;
}

/**
 * Backdrop component
 * Vaste, volledig-scherm overlay die de achtergrondinhoud visueel verhult
 * wanneer een modaal UI-element open is (Modal Dialog, Drawer).
 *
 * Altijd aria-hidden="true" — puur decoratief, geen interactieve rol.
 * Conditioneel renderen vanuit de parent.
 *
 * @example
 * ```tsx
 * {isOpen && <Backdrop />}
 * {isOpen && <Backdrop blur={false} />}
 * ```
 */
export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  ({ className, blur = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          'dsn-backdrop',
          !blur && 'dsn-backdrop--no-blur',
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Backdrop.displayName = 'Backdrop';
