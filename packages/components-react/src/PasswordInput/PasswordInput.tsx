import React from 'react';
import { classNames, FormControlInlineSize } from '@dsn-starter-kit/core';
import './PasswordInput.css';

/**
 * Inline-size variants offered by PasswordInput. xs and sm are left out: they
 * are too narrow for the content this field is meant for.
 */
export type PasswordInputInlineSize = Exclude<
  FormControlInlineSize,
  'xs' | 'sm'
>;

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
   * Inline-size variant for the input (md, lg, xl or full)
   * @default undefined (uses default max-inline-size from form-control)
   */
  inlineSize?: PasswordInputInlineSize;

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
      inlineSize,
      autoComplete,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-text-input',
      inlineSize && `dsn-text-input--inline-size-${inlineSize}`,
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
