import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import './PasswordInput.css';

export type PasswordAutocomplete = 'current-password' | 'new-password' | 'off';

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /**
   * Autocomplete hint for password managers
   * - 'current-password': voor inlogformulieren (default)
   * - 'new-password': voor registratie- en wachtwoord wijzigformulieren
   * - 'off': autocomplete uitschakelen
   * @default 'current-password'
   */
  passwordAutocomplete?: PasswordAutocomplete;

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
 * Password Input component
 * Uses type="password" for secure text entry.
 * Het tonen/verbergen van het wachtwoord is bewust niet ingebouwd in dit component —
 * dat patroon wordt separaat gedefinieerd via een Button naast het invoerveld.
 *
 * @example
 * ```tsx
 * // Login form (current password)
 * <PasswordInput placeholder="Wachtwoord" />
 *
 * // Registration form (new password)
 * <PasswordInput passwordAutocomplete="new-password" placeholder="Nieuw wachtwoord" />
 *
 * // With label
 * <FormFieldLabel htmlFor="password">Wachtwoord</FormFieldLabel>
 * <PasswordInput id="password" />
 *
 * // Invalid state
 * <PasswordInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      passwordAutocomplete = 'current-password',
      className,
      invalid,
      width,
      autoComplete,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-text-input',
      width && `dsn-text-input--width-${width}`,
      className
    );

    return (
      <input
        ref={ref}
        type="password"
        className={classes}
        autoComplete={autoComplete || passwordAutocomplete}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
