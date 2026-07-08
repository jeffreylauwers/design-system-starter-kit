import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './ActionGroup.css';

export interface ActionGroupProps extends React.HTMLAttributes<HTMLUListElement> {
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
 * Flattens top-level React.Fragment children (e.g. `<>...</>`) so each
 * action ends up as its own `<li>`, regardless of whether the caller wraps
 * multiple children in a Fragment or passes them as direct JSX children.
 */
function flattenActions(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flattenActions((child.props as { children?: React.ReactNode }).children)
      : [child]
  );
}

/**
 * ActionGroup component
 * Groepeert gerelateerde acties en verzorgt de lay-out van Buttons en Links.
 * Horizontale richting (default) wraps automatisch bij te weinig ruimte.
 * Rendert als `<ul>` met elke actie in een `<li>`, zodat screenreaders het
 * aantal acties en de groepsnaam aankondigen (zie issue #295).
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
 *
 * // Aangepast aria-label
 * <ActionGroup aria-label="Formulierknoppen">
 *   <Button variant="strong" type="submit">Verstuur</Button>
 *   <Button variant="subtle">Annuleren</Button>
 * </ActionGroup>
 * ```
 */
export const ActionGroup = React.forwardRef<HTMLUListElement, ActionGroupProps>(
  (
    {
      className,
      direction = 'horizontal',
      'aria-label': ariaLabel = 'Acties',
      children,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-action-group',
      direction === 'vertical' && 'dsn-action-group--vertical',
      className
    );

    return (
      <ul ref={ref} className={classes} aria-label={ariaLabel} {...props}>
        {flattenActions(children).map((child, index) => (
          <li className="dsn-action-group__item" key={index}>
            {child}
          </li>
        ))}
      </ul>
    );
  }
);

ActionGroup.displayName = 'ActionGroup';
