import React from 'react';
import { classNames } from '@dsn/core';
import './Link.css';

export type LinkSize = 'small' | 'default' | 'large';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the link represents the current page
   * @default false
   */
  current?: boolean;

  /**
   * Link size — controls font-size, gap, and icon size.
   * When omitted, the link inherits the surrounding font (ideal for inline usage in paragraphs).
   */
  size?: LinkSize;

  /**
   * Icon element rendered before the link text
   */
  iconStart?: React.ReactNode;

  /**
   * Icon element rendered after the link text
   */
  iconEnd?: React.ReactNode;

  /**
   * Whether the link opens in a new tab.
   * Automatically adds target="_blank", rel="noopener noreferrer",
   * and an inline "(opent nieuw tabblad)" hint.
   * @default false
   */
  external?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Link content
   */
  children?: React.ReactNode;
}

/**
 * Link component with icon support and size variants
 *
 * @example
 * ```tsx
 * // Basic usage (inherits font from parent)
 * <Link href="/about">About us</Link>
 *
 * // With explicit size
 * <Link href="/about" size="small">Small link</Link>
 * <Link href="/about" size="default">Default link</Link>
 * <Link href="/about" size="large">Large link</Link>
 *
 * // With icon before text
 * <Link href="/download" iconStart={<Icon name="download" />}>
 *   Download
 * </Link>
 *
 * // With icon after text
 * <Link href="/next" iconEnd={<Icon name="arrow-right" />}>
 *   Next page
 * </Link>
 *
 * // External link (opens in new tab with visible hint)
 * <Link href="https://example.com" external>
 *   External site
 * </Link>
 *
 * // Current page
 * <Link href="/dashboard" current>Dashboard</Link>
 *
 * // Disabled
 * <Link disabled>Unavailable</Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      disabled = false,
      current = false,
      external = false,
      size,
      iconStart,
      iconEnd,
      className,
      href,
      target,
      rel,
      tabIndex,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Only add size class when explicitly provided.
    // Without a size prop, the link inherits font from its parent,
    // which is the expected behavior for inline usage in paragraphs.
    const classes = classNames(
      'dsn-link',
      size && `dsn-link--size-${size}`,
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // External links: add target, rel, and visible hint automatically
    const resolvedTarget = external ? (target ?? '_blank') : target;
    const resolvedRel = external ? (rel ?? 'noopener noreferrer') : rel;

    return (
      <a
        ref={ref}
        className={classes}
        href={disabled ? undefined : href}
        target={resolvedTarget}
        rel={resolvedRel}
        tabIndex={disabled ? -1 : tabIndex}
        aria-disabled={disabled || undefined}
        aria-current={current ? 'page' : undefined}
        onClick={handleClick}
        {...props}
      >
        {iconStart}
        {children}
        {external && ' (opent nieuw tabblad)'}
        {iconEnd}
      </a>
    );
  }
);

Link.displayName = 'Link';
