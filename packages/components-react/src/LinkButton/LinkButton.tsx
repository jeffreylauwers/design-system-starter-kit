import React from 'react';
import { classNames } from '@dsn/core';
import './LinkButton.css';

export type LinkButtonSize = 'small' | 'default' | 'large';

export interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button size — controls font-size, gap, and icon size.
   * When omitted, the button inherits the surrounding font (same as Link).
   */
  size?: LinkButtonSize;

  /**
   * Icon element rendered before the button text
   */
  iconStart?: React.ReactNode;

  /**
   * Icon element rendered after the button text
   */
  iconEnd?: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Button content
   */
  children?: React.ReactNode;
}

/**
 * LinkButton — semantically a <button>, visually styled as a Link.
 *
 * Use when an action requires a JavaScript handler or form submit,
 * but the visual prominence of a Button does not fit the context.
 *
 * @example
 * ```tsx
 * // Basic usage (inherits font from parent)
 * <LinkButton onClick={handleClick}>Wachtwoord vergeten?</LinkButton>
 *
 * // With explicit size
 * <LinkButton size="small">Klein</LinkButton>
 *
 * // With icon
 * <LinkButton iconStart={<Icon name="arrow-left" aria-hidden />}>Terug</LinkButton>
 *
 * // Disabled
 * <LinkButton disabled>Niet beschikbaar</LinkButton>
 *
 * // Form submit
 * <LinkButton type="submit">Bevestigen</LinkButton>
 * ```
 */
export const LinkButton = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  (
    {
      size,
      iconStart,
      iconEnd,
      className,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-link',
      'dsn-link-button',
      size && `dsn-link--size-${size}`,
      className
    );

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {iconStart}
        {children}
        {iconEnd}
      </button>
    );
  }
);

LinkButton.displayName = 'LinkButton';
