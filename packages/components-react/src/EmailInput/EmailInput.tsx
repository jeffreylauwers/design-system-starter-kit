import React from 'react';
import { classNames, FormControlInlineSize } from '@dsn-starter-kit/core';
import './EmailInput.css';

/**
 * Inline-size variants offered by EmailInput. xs and sm are left out: they
 * are too narrow for the content this field is meant for.
 */
export type EmailInputInlineSize = Exclude<FormControlInlineSize, 'xs' | 'sm'>;

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
   * Inline-size variant for the input (md, lg, xl or full)
   * @default undefined (uses default max-inline-size from form-control)
   */
  inlineSize?: EmailInputInlineSize;

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
  ({ className, invalid, inlineSize, autoComplete, ...props }, ref) => {
    const classes = classNames(
      'dsn-text-input',
      inlineSize && `dsn-text-input--inline-size-${inlineSize}`,
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
