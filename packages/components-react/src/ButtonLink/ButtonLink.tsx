import React from 'react';
import { classNames } from '@dsn/core';
import './ButtonLink.css';

export type ButtonLinkVariant =
  | 'strong'
  | 'strong-negative'
  | 'strong-positive'
  | 'default'
  | 'default-negative'
  | 'default-positive'
  | 'subtle'
  | 'subtle-negative'
  | 'subtle-positive';

export type ButtonLinkSize = 'small' | 'default' | 'large';

export interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Navigation URL
   */
  href?: string;

  /**
   * Visual style — same variants as Button (excl. 'link')
   * @default 'strong'
   */
  variant?: ButtonLinkVariant;

  /**
   * Button size
   * @default 'default'
   */
  size?: ButtonLinkSize;

  /**
   * Whether the button-link takes full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether button-link contains only an icon (hides label text visually)
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Icon element rendered before the label text
   */
  iconStart?: React.ReactNode;

  /**
   * Icon element rendered after the label text
   */
  iconEnd?: React.ReactNode;

  /**
   * Whether the link is disabled.
   * Maps to aria-disabled="true" + tabIndex={-1} + prevents navigation.
   * <a> has no native disabled attribute.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the link opens in a new tab.
   * Automatically adds target="_blank", rel="noopener noreferrer",
   * and an inline "(opent nieuw tabblad)" hint — same behaviour as Link.
   * @default false
   */
  external?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Link content (wrapped in dsn-button__label, same as Button)
   */
  children?: React.ReactNode;
}

/**
 * ButtonLink — semantically an <a>, visually styled as a Button.
 *
 * Use when an action navigates to a URL but needs the visual prominence of a Button.
 *
 * @example
 * ```tsx
 * // Basic usage (strong, default size)
 * <ButtonLink href="/volgende">Volgende stap</ButtonLink>
 *
 * // Subtle variant
 * <ButtonLink href="/" variant="subtle">Terug naar overzicht</ButtonLink>
 *
 * // With icon
 * <ButtonLink href="/download" iconStart={<Icon name="download" aria-hidden />}>
 *   Download rapport
 * </ButtonLink>
 *
 * // Icon-only
 * <ButtonLink href="/info" iconOnly iconStart={<Icon name="info-circle" aria-hidden />}>
 *   Meer informatie
 * </ButtonLink>
 *
 * // Disabled
 * <ButtonLink href="/dashboard" disabled>Niet beschikbaar</ButtonLink>
 *
 * // Opens in new tab with visible hint
 * <ButtonLink href="https://example.com" external>Externe pagina</ButtonLink>
 * ```
 */
export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
      variant = 'strong',
      size = 'default',
      fullWidth = false,
      iconOnly = false,
      iconStart,
      iconEnd,
      disabled = false,
      external = false,
      className,
      target,
      rel,
      tabIndex,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
      fullWidth && 'dsn-button--full-width',
      iconOnly && 'dsn-button--icon-only',
      'dsn-button-link',
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // External links: set target and rel automatically, unless explicitly overridden
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
        onClick={handleClick}
        {...props}
      >
        {iconStart}
        {children !== undefined && children !== null && (
          <span className="dsn-button__label">{children}</span>
        )}
        {external && ' (opent nieuw tabblad)'}
        {iconEnd}
      </a>
    );
  }
);

ButtonLink.displayName = 'ButtonLink';
