import React from 'react';
import { classNames } from '@dsn/core';
import { Icon } from '../Icon';

export interface BreadcrumbNavigationItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * URL van de pagina
   */
  href: string;

  /**
   * Markeert het huidige pagina-item; voegt `aria-current="page"` toe
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
 * @example
 * ```tsx
 * <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
 * <BreadcrumbNavigationItem href="/categorie" current>Categorie</BreadcrumbNavigationItem>
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

    return (
      <li ref={ref} className={itemClasses}>
        <a
          href={href}
          className="dsn-breadcrumb-navigation__link"
          aria-current={current ? 'page' : undefined}
          {...props}
        >
          {showBackIcon && (
            <Icon
              name="arrow-left"
              className="dsn-breadcrumb-navigation__back-icon"
              aria-hidden
            />
          )}
          {children}
        </a>
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
