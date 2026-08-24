import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import './FormFieldStatus.css';

export type FormFieldStatusVariant = 'default' | 'positive' | 'warning';

export interface FormFieldStatusProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Status variant
   * @default 'default'
   */
  variant?: FormFieldStatusVariant;

  /**
   * Whether to show the icon (only for positive and warning variants)
   * @default true
   */
  showIcon?: boolean;

  /**
   * Whether to announce changes to this status via an aria-live region.
   * Enable this only for status text that changes during interaction, such as
   * a character counter. A status that never changes should not be a live
   * region: it would be announced twice.
   * @default false
   */
  live?: boolean;

  /**
   * Status content
   */
  children?: React.ReactNode;
}

/**
 * Form Field Status component
 * Status message displayed below the form control
 * Supports three variants: default (subtle info), positive (success), warning (caution)
 *
 * @example
 * ```tsx
 * // Default - Character counter (no icon)
 * <FormFieldStatus>45 van 100 karakters</FormFieldStatus>
 *
 * // Positive - Success feedback (with check icon)
 * <FormFieldStatus variant="positive">Wachtwoord is sterk genoeg</FormFieldStatus>
 *
 * // Warning - Caution (with alert-triangle icon)
 * <FormFieldStatus variant="warning">Wachtwoord is zwak</FormFieldStatus>
 *
 * // Without icon (for positive/warning)
 * <FormFieldStatus variant="positive" showIcon={false}>
 *   Gebruikersnaam beschikbaar
 * </FormFieldStatus>
 *
 * // With ID for aria-describedby
 * <FormFieldStatus id="bio-status">
 *   280 van 500 karakters gebruikt
 * </FormFieldStatus>
 * ```
 */
export const FormFieldStatus = React.forwardRef<
  HTMLParagraphElement,
  FormFieldStatusProps
>(
  (
    {
      className,
      variant = 'default',
      showIcon = true,
      live = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = classNames(
      'dsn-form-field-status',
      variant !== 'default' && `dsn-form-field-status--${variant}`,
      className
    );

    const iconName =
      variant === 'positive'
        ? 'check'
        : variant === 'warning'
          ? 'alert-triangle'
          : null;
    const shouldShowIcon = showIcon && iconName && variant !== 'default';

    return (
      <p
        ref={ref}
        className={classes}
        aria-live={live ? 'polite' : undefined}
        aria-atomic={live ? true : undefined}
        {...props}
      >
        {shouldShowIcon && <Icon name={iconName} aria-hidden="true" />}
        {children}
      </p>
    );
  }
);

FormFieldStatus.displayName = 'FormFieldStatus';
