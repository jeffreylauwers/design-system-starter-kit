import React from 'react';
import { classNames } from '@dsn/core';
import { BreadcrumbNavigationItemProps } from './BreadcrumbNavigationItem';
import './BreadcrumbNavigation.css';

export interface BreadcrumbNavigationProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Toegankelijke naam van het `<nav>` landmark
   * @default "Broodkruimelpad"
   */
  'aria-label'?: string;

  /**
   * `"compact"` activeert container-query responsief gedrag:
   * bij weinig ruimte wordt enkel het ouder-item met terug-pijl getoond
   * @default "default"
   */
  variant?: 'default' | 'compact';

  /**
   * `BreadcrumbNavigationItem` elementen
   */
  children: React.ReactNode;
}

/**
 * BreadcrumbNavigation component
 * Toont de hiërarchische locatie van de gebruiker en biedt navigatie naar bovenliggende pagina's.
 * Plaatsen vóór `<main>`, na de primaire navigatie.
 *
 * @example
 * ```tsx
 * // Standaard
 * <BreadcrumbNavigation aria-label="Broodkruimelpad">
 *   <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
 *   <BreadcrumbNavigationItem href="/categorie">Categorie</BreadcrumbNavigationItem>
 *   <BreadcrumbNavigationItem href="/product" current>Product</BreadcrumbNavigationItem>
 * </BreadcrumbNavigation>
 *
 * // Compact variant
 * <BreadcrumbNavigation aria-label="Broodkruimelpad" variant="compact">
 *   <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
 *   <BreadcrumbNavigationItem href="/categorie">Categorie</BreadcrumbNavigationItem>
 *   <BreadcrumbNavigationItem href="/product" current>Product</BreadcrumbNavigationItem>
 * </BreadcrumbNavigation>
 * ```
 */
export const BreadcrumbNavigation = React.forwardRef<
  HTMLElement,
  BreadcrumbNavigationProps
>(
  (
    {
      className,
      'aria-label': ariaLabel = 'Broodkruimelpad',
      variant = 'default',
      children,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-breadcrumb-navigation',
      variant === 'compact' && 'dsn-breadcrumb-navigation--compact',
      className
    );

    const childArray = React.Children.toArray(children);

    const processedChildren = childArray.map((child, index) => {
      if (!React.isValidElement(child)) return child;

      const isParentOfCurrent =
        variant === 'compact' && index === childArray.length - 2;

      if (isParentOfCurrent) {
        return React.cloneElement(
          child as React.ReactElement<BreadcrumbNavigationItemProps>,
          { showBackIcon: true }
        );
      }

      return child;
    });

    return (
      <nav ref={ref} className={classes} aria-label={ariaLabel} {...props}>
        <ol className="dsn-breadcrumb-navigation__list">{processedChildren}</ol>
      </nav>
    );
  }
);

BreadcrumbNavigation.displayName = 'BreadcrumbNavigation';
