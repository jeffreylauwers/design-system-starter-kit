import React from 'react';
import { classNames, FormControlWidth } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import './SearchInput.css';

export interface SearchInputProps extends Omit<
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
 * Search Input component
 * Search input with a non-interactive search icon positioned at inline-start.
 * The icon has the same color as the input text (dsn-text-input-color).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SearchInput placeholder="Zoeken..." />
 *
 * // With label
 * <FormFieldLabel htmlFor="search">Zoeken</FormFieldLabel>
 * <SearchInput id="search" />
 *
 * // Invalid state
 * <SearchInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, invalid, width, ...props }, ref) => {
    const wrapperClasses = classNames(
      'dsn-search-input-wrapper',
      width && `dsn-search-input-wrapper--width-${width}`
    );
    const inputClasses = classNames(
      'dsn-text-input',
      'dsn-search-input',
      className
    );

    return (
      <div className={wrapperClasses}>
        <Icon name="search" className="dsn-search-input__icon" aria-hidden />
        <input
          ref={ref}
          type="search"
          className={inputClasses}
          aria-invalid={invalid || undefined}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
