import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './SkipLink.css';

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Het doel-ID waarnaar de gebruiker gesprongen wordt (inclusief `#`).
   * Het element met dit ID moet `tabindex="-1"` hebben als het niet natively focusbaar is.
   * @example "#main-content"
   */
  href: string;

  /**
   * Tekst van de skip-link — zichtbaar voor screenreaders en bij focus.
   * @default "Ga direct naar de hoofdinhoud"
   */
  children?: React.ReactNode;

  /**
   * Extra CSS klassen
   */
  className?: string;
}

/**
 * SkipLink — toegankelijkheidskoppeling om herhalende navigatie te omzeilen.
 *
 * Plaatst de link als **eerste focusbaar element** in de DOM, vóór `<header>` en `<nav>`.
 * Voldoet aan WCAG 2.2 succescriterium 2.4.1 (Bypass Blocks, Level A).
 *
 * @example
 * ```tsx
 * // Standaard gebruik — eerste element in <body>
 * <SkipLink href="#main-content">Ga direct naar de hoofdinhoud</SkipLink>
 * <header>...</header>
 * <main id="main-content" tabIndex={-1}>...</main>
 * ```
 */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    { href, children = 'Ga direct naar de hoofdinhoud', className, ...props },
    ref
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        className={classNames('dsn-skip-link', className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';
