import React from 'react';
import { classNames, FormControlInlineSize } from '@dsn-starter-kit/core';
import './TelephoneInput.css';

/**
 * Inline-size variants offered by TelephoneInput. xs and sm are left out: they
 * are too narrow for the content this field is meant for.
 */
export type TelephoneInputInlineSize = Exclude<
  FormControlInlineSize,
  'xs' | 'sm'
>;

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
   * Inline-size variant for the input (md, lg, xl or full)
   * @default 'md'
   */
  inlineSize?: TelephoneInputInlineSize;

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
>(({ className, invalid, inlineSize = 'md', autoComplete, ...props }, ref) => {
  const classes = classNames(
    'dsn-text-input',
    inlineSize && `dsn-text-input--inline-size-${inlineSize}`,
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
