import React from 'react';
import { classNames } from '@dsn/core';
import './Menu.css';

export type MenuOrientation = 'vertical' | 'horizontal';

export interface MenuProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * Bepaalt de lay-out van de items.
   * - `vertical` (standaard): items onder elkaar, volledige breedte
   * - `horizontal`: items naast elkaar, breedte op inhoud
   * @default 'vertical'
   */
  orientation?: MenuOrientation;

  /**
   * `MenuLink`- en/of `MenuButton`-items (verplicht)
   */
  children: React.ReactNode;

  /**
   * Aanvullende CSS-klassen voor het `<ul>`-element
   */
  className?: string;
}

/**
 * Menu component
 * Containercomponent voor MenuLink- en MenuButton-items.
 * Rendert een `<ul>` met verticale (standaard) of horizontale oriëntatie.
 *
 * Gebruik `Menu` altijd binnen een semantisch element zoals `<nav>` —
 * dit is de verantwoordelijkheid van de ouder.
 *
 * @example
 * ```tsx
 * // Verticaal (standaard)
 * <nav aria-label="Hoofdnavigatie">
 *   <Menu>
 *     <MenuLink href="/home">Home</MenuLink>
 *     <MenuLink href="/over">Over ons</MenuLink>
 *     <MenuButton onClick={handleLogout}>Uitloggen</MenuButton>
 *   </Menu>
 * </nav>
 *
 * // Horizontaal
 * <nav aria-label="Paginanavigatie">
 *   <Menu orientation="horizontal">
 *     <MenuLink href="/home" current>Home</MenuLink>
 *     <MenuLink href="/over">Over ons</MenuLink>
 *   </Menu>
 * </nav>
 * ```
 */
export const Menu = React.forwardRef<HTMLUListElement, MenuProps>(
  ({ orientation = 'vertical', className, children, ...props }, ref) => {
    const classes = classNames(
      'dsn-menu',
      orientation === 'horizontal' && 'dsn-menu--horizontal',
      className
    );

    return (
      <ul ref={ref} className={classes} {...props}>
        {children}
      </ul>
    );
  }
);

Menu.displayName = 'Menu';
