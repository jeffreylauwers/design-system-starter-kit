/**
 * Form-related type definitions
 */

/**
 * Inline-size variants for form controls (inputs, textareas, etc.)
 * Based on design tokens: dsn.form-control.inline-size.*
 *
 * Not every form control offers every variant; components narrow this
 * type to the variants that make sense for their content.
 */
export type FormControlInlineSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
