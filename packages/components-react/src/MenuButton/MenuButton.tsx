import React from 'react';
import { classNames } from '@dsn/core';
import './MenuButton.css';

export interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icoon links van het label
   */
  iconStart?: React.ReactNode;

  /**
   * Icoon rechts van het label
   */
  iconEnd?: React.ReactNode;

  /**
   * DotBadge element voor statusindicatie (bijv. nieuw/ongelezen zonder getal).
   * Verwacht een `<DotBadge>` component.
   */
  dotBadge?: React.ReactNode;

  /**
   * Zichtbare knoptekst
   */
  children?: React.ReactNode;

  /**
   * Aanvullende CSS-klassen voor het `<li>`-element
   */
  className?: string;
}

/**
 * MenuButton component
 * Navigatieknop voor JavaScript-acties — semantisch een `<button>`, visueel consistent met MenuLink.
 *
 * Gebruik in een `<ul>`-element wanneer de actie geen URL-navigatie is maar een JS-handeling triggert
 * (bijv. uitloggen, een modal openen of een sectie in/uitklappen).
 *
 * @example
 * ```tsx
 * // Basisgebruik
 * <MenuButton onClick={handleLogout}>Uitloggen</MenuButton>
 *
 * // Met icoon start
 * <MenuButton iconStart={<Icon name="settings" aria-hidden />}>
 *   Instellingen
 * </MenuButton>
 *
 * // Met DotBadge (statusindicatie)
 * <MenuButton
 *   iconStart={<Icon name="bell" aria-hidden />}
 *   dotBadge={<DotBadge variant="negative" />}
 * >
 *   Meldingen
 *   <span className="dsn-visually-hidden">, nieuwe meldingen beschikbaar</span>
 * </MenuButton>
 * ```
 */
export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (
    {
      iconStart,
      iconEnd,
      dotBadge,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const liClasses = classNames('dsn-menu-button', className);

    return (
      <li className={liClasses}>
        <button
          ref={ref}
          type={type}
          className="dsn-menu-button__button"
          {...props}
        >
          {iconStart}
          <span className="dsn-menu-button__label">
            {children}
            {dotBadge}
          </span>
          {iconEnd}
        </button>
      </li>
    );
  }
);

MenuButton.displayName = 'MenuButton';
