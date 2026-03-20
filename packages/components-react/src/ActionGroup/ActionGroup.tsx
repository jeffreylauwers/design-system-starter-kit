import React from 'react';
import { classNames } from '@dsn/core';
import './ActionGroup.css';

export interface ActionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Richting van de groep — horizontale rij met wrapping of verticale kolom
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * `Button`- en/of `Link`-componenten
   */
  children?: React.ReactNode;
}

/**
 * ActionGroup component
 * Groepeert gerelateerde acties en verzorgt de lay-out van Buttons en Links.
 * Horizontale richting (default) wraps automatisch bij te weinig ruimte.
 *
 * @example
 * ```tsx
 * // Horizontaal (default)
 * <ActionGroup>
 *   <Button variant="strong">Opslaan</Button>
 *   <Button variant="subtle">Annuleren</Button>
 * </ActionGroup>
 *
 * // Horizontaal met Link
 * <ActionGroup>
 *   <Button variant="strong">Volgende stap</Button>
 *   <Link href="/">Terug naar overzicht</Link>
 * </ActionGroup>
 *
 * // Verticaal
 * <ActionGroup direction="vertical">
 *   <Button variant="strong">Primaire actie</Button>
 *   <Button variant="subtle">Secundaire actie</Button>
 * </ActionGroup>
 * ```
 */
export const ActionGroup = React.forwardRef<HTMLDivElement, ActionGroupProps>(
  ({ className, direction = 'horizontal', children, ...props }, ref) => {
    const classes = classNames(
      'dsn-action-group',
      direction === 'vertical' && 'dsn-action-group--vertical',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

ActionGroup.displayName = 'ActionGroup';
