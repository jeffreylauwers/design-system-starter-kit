import React from 'react';
import { classNames, FormControlInlineSize } from '@dsn-starter-kit/core';
import './TextArea.css';

/**
 * Inline-size variants offered by TextArea. xs and sm are left out: they
 * are too narrow for the content this field is meant for.
 */
export type TextAreaInlineSize = Exclude<FormControlInlineSize, 'xs' | 'sm'>;

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether the textarea is in an invalid state
   * @default false
   */
  invalid?: boolean;

  /**
   * Inline-size variant for the textarea (md, lg, xl or full)
   * @default undefined (uses default max-inline-size from form-control)
   */
  inlineSize?: TextAreaInlineSize;
}

/**
 * Text Area component
 * Multi-line text input with support for various states (hover, focus, disabled, invalid, read-only)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TextArea placeholder="Enter your bio" rows={4} />
 *
 * // With label
 * <FormFieldLabel htmlFor="bio">Biography</FormFieldLabel>
 * <TextArea id="bio" rows={6} />
 *
 * // Disabled
 * <TextArea disabled value="Cannot edit" rows={3} />
 *
 * // Invalid
 * <TextArea invalid aria-invalid="true" aria-describedby="error" rows={4} />
 *
 * // Read-only
 * <TextArea readOnly value="View only" rows={3} />
 * ```
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, invalid, inlineSize, rows = 4, ...props }, ref) => {
    const classes = classNames(
      'dsn-text-area',
      inlineSize && `dsn-text-area--inline-size-${inlineSize}`,
      className
    );

    return (
      <textarea
        ref={ref}
        className={classes}
        rows={rows}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
