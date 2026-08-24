import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';

export interface BreadcrumbNavigationItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * URL van de pagina. Laat weg bij het huidige pagina-item: dat wordt
   * als platte tekst gerenderd en niet als link
   */
  href?: string;

  /**
   * Markeert het huidige pagina-item. Rendert de tekst zonder link en
   * zet `aria-current="page"` op de `<li>`
   * @default false
   */
  current?: boolean;

  /**
   * Zichtbare link- of paginatekst
   */
  children: React.ReactNode;

  /**
   * @internal — wordt gezet door BreadcrumbNavigation (compact variant)
   */
  showBackIcon?: boolean;
}

/**
 * BreadcrumbNavigationItem component
 * Enkel item in een BreadcrumbNavigation. Gebruik altijd binnen een `<BreadcrumbNavigation>`.
 *
 * Het huidige pagina-item is bewust géén link: een link naar de pagina waar je
 * al bent doet niets, terwijl hij er wel uitziet als de andere items. Zie
 * WCAG 3.2.4 Consistent Identification.
 *
 * @example
 * ```tsx
 * <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
 * <BreadcrumbNavigationItem current>Categorie</BreadcrumbNavigationItem>
 * ```
 */
export const BreadcrumbNavigationItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbNavigationItemProps
>(
  (
    {
      className,
      href,
      current = false,
      showBackIcon = false,
      children,
      ...props
    },
    ref
  ) => {
    const itemClasses = classNames(
      'dsn-breadcrumb-navigation__item',
      current && 'dsn-breadcrumb-navigation__item--current',
      className
    );

    // Het huidige item krijgt geen link; zonder href valt een item daar ook op terug
    const renderAsLink = !current && href !== undefined;

    return (
      <li
        ref={ref}
        className={itemClasses}
        aria-current={current ? 'page' : undefined}
        {...(renderAsLink
          ? {}
          : (props as React.LiHTMLAttributes<HTMLLIElement>))}
      >
        {renderAsLink ? (
          <a href={href} className="dsn-breadcrumb-navigation__link" {...props}>
            {showBackIcon && (
              <Icon
                name="arrow-left"
                className="dsn-breadcrumb-navigation__back-icon"
                aria-hidden
              />
            )}
            {children}
          </a>
        ) : (
          children
        )}
        <Icon
          name="chevron-right"
          className="dsn-breadcrumb-navigation__separator"
          aria-hidden
        />
      </li>
    );
  }
);

BreadcrumbNavigationItem.displayName = 'BreadcrumbNavigationItem';
