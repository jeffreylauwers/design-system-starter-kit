import React from 'react';
import { classNames } from '@dsn/core';
import { Icon } from '../Icon';
import './Button.css';

export type ButtonVariant =
  | 'strong'
  | 'strong-negative'
  | 'strong-positive'
  | 'default'
  | 'default-negative'
  | 'default-positive'
  | 'subtle'
  | 'subtle-negative'
  | 'subtle-positive';
export type ButtonSize = 'small' | 'default' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual style
   * @default 'strong'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'default'
   */
  size?: ButtonSize;

  /**
   * Whether button shows loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Whether button takes full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether button contains only an icon (adjusts padding)
   * @default false
   */
  iconOnly?: boolean;

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
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button variant="strong">Save</Button>
 *
 * // With icon before text
 * <Button variant="default" iconStart={<Icon name="plus" />}>
 *   Add item
 * </Button>
 *
 * // With icon after text
 * <Button variant="default" iconEnd={<Icon name="arrow-right" />}>
 *   Next
 * </Button>
 *
 * // With icons on both sides
 * <Button iconStart={<Icon name="check" />} iconEnd={<Icon name="arrow-right" />}>
 *   Confirm
 * </Button>
 *
 * // Icon only — children is the accessible text label, icon via iconStart
 * <Button variant="subtle" iconOnly iconStart={<Icon name="x" />}>
 *   Sluiten
 * </Button>
 *
 * // Loading state
 * <Button loading disabled>Saving...</Button>
 *
 * // Different sizes
 * <Button size="small">Small</Button>
 * <Button size="default">Default</Button>
 * <Button size="large">Large</Button>
 *
 * // Sentiment variants
 * <Button variant="strong-negative">Delete</Button>
 * <Button variant="strong-positive">Confirm</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'strong',
      size = 'default',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      iconStart,
      iconEnd,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-button',
      `dsn-button--${variant}`,
      `dsn-button--size-${size}`,
      loading && 'dsn-button--loading',
      fullWidth && 'dsn-button--full-width',
      iconOnly && 'dsn-button--icon-only',
      className
    );

    const loaderIcon = loading ? (
      <Icon name="loader" className="dsn-button__loader" aria-hidden />
    ) : null;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? loaderIcon : iconStart}
        {children !== undefined && children !== null && (
          <span className="dsn-button__label">{children}</span>
        )}
        {iconEnd}
      </button>
    );
  }
);

Button.displayName = 'Button';
