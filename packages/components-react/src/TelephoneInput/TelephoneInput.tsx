import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import './TelephoneInput.css';

export interface TelephoneInputProps extends Omit<
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
 * Telephone Input component
 * Telephone input with appropriate inputmode and autocomplete
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TelephoneInput placeholder="06 12345678" />
 *
 * // With label
 * <FormFieldLabel htmlFor="phone">Telefoonnummer</FormFieldLabel>
 * <TelephoneInput id="phone" />
 *
 * // Invalid state
 * <TelephoneInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const TelephoneInput = React.forwardRef<
  HTMLInputElement,
  TelephoneInputProps
>(({ className, invalid, width, autoComplete, ...props }, ref) => {
  const classes = classNames(
    'dsn-text-input',
    width && `dsn-text-input--width-${width}`,
    className
  );

  return (
    <input
      ref={ref}
      type="tel"
      inputMode="tel"
      className={classes}
      autoComplete={autoComplete || 'tel'}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

TelephoneInput.displayName = 'TelephoneInput';
