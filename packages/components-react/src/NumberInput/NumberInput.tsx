import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import './NumberInput.css';

export interface NumberInputProps extends Omit<
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
   * Allow decimal input (e.g. amounts). When false, uses GOV.UK pattern:
   * inputmode="numeric" + pattern="[0-9]*" for a numeric-only keyboard.
   * When true, uses inputmode="decimal" without pattern restriction.
   * @default false
   */
  allowDecimals?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Number Input component
 * Uses type="text" with inputmode="decimal" for better mobile UX (no spinner buttons)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <NumberInput placeholder="0,00" />
 *
 * // With label
 * <FormFieldLabel htmlFor="amount">Bedrag</FormFieldLabel>
 * <NumberInput id="amount" />
 *
 * // Invalid state
 * <NumberInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, invalid, width, allowDecimals = false, ...props }, ref) => {
    const classes = classNames(
      'dsn-text-input',
      width && `dsn-text-input--width-${width}`,
      className
    );

    return (
      <input
        ref={ref}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        pattern={allowDecimals ? undefined : '[0-9]*'}
        className={classes}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
