import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import './EmailInput.css';

export interface EmailInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /**
   * Whether the input is in an invalid state
   * @default false
   */
  invalid?: boolean;

  /**
   * Width variant for the input
   * @default undefined (uses default max-width from form-control)
   */
  width?: FormControlWidth;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Email Input component
 * Email input with appropriate inputmode and autocomplete
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmailInput placeholder="naam@voorbeeld.nl" />
 *
 * // With label
 * <FormFieldLabel htmlFor="email">E-mailadres</FormFieldLabel>
 * <EmailInput id="email" />
 *
 * // Invalid state
 * <EmailInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, invalid, width, autoComplete, ...props }, ref) => {
    const classes = classNames(
      'dsn-text-input',
      width && `dsn-text-input--width-${width}`,
      className
    );

    return (
      <input
        ref={ref}
        type="email"
        inputMode="email"
        className={classes}
        autoComplete={autoComplete || 'email'}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';
