import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import './Select.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Whether the select is in an invalid state
   * @default false
   */
  invalid?: boolean;

  /**
   * Width variant for the select
   * @default undefined (uses default max-width from form-control)
   */
  width?: FormControlWidth;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Select component
 * Dropdown select with a custom chevron-down icon at inline-end.
 * The native select arrow is hidden; the custom icon is decorative and non-interactive.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Select>
 *   <option value="">Kies een optie</option>
 *   <option value="1">Optie 1</option>
 *   <option value="2">Optie 2</option>
 * </Select>
 *
 * // With label
 * <FormField label="Land" htmlFor="land">
 *   <Select id="land">
 *     <option value="">Kies een land</option>
 *     <option value="nl">Nederland</option>
 *     <option value="be">België</option>
 *   </Select>
 * </FormField>
 *
 * // Width variant
 * <Select width="lg">...</Select>
 *
 * // Invalid state
 * <Select invalid aria-invalid="true" aria-describedby="error">...</Select>
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, width, disabled, children, ...props }, ref) => {
    const wrapperClasses = classNames(
      'dsn-select-wrapper',
      width && `dsn-select-wrapper--width-${width}`
    );

    const selectClasses = classNames('dsn-text-input', 'dsn-select', className);

    return (
      <div className={wrapperClasses}>
        <select
          ref={ref}
          className={selectClasses}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        {!disabled && (
          <Icon name="chevron-down" className="dsn-select__icon" aria-hidden />
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
