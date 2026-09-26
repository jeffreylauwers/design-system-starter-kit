import React from 'react';
import { classNames, FormControlInlineSize } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import './SearchInput.css';

/**
 * Inline-size variants offered by SearchInput. xs and sm are left out: they
 * are too narrow for the content this field is meant for.
 */
export type SearchInputInlineSize = Exclude<FormControlInlineSize, 'xs' | 'sm'>;

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
   * Inline-size variant for the input (md, lg, xl or full)
   * @default undefined (uses default max-inline-size from form-control)
   */
  inlineSize?: SearchInputInlineSize;

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
  ({ className, invalid, inlineSize, ...props }, ref) => {
    const wrapperClasses = classNames(
      'dsn-search-input-wrapper',
      inlineSize && `dsn-search-input-wrapper--inline-size-${inlineSize}`
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
