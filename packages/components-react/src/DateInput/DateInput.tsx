import React from 'react';
import { classNames } from '@dsn/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import '../TextInput/TextInput.css';
import './DateInput.css';

export interface DateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /**
   * Whether the input is in an invalid state
   * @default false
   */
  invalid?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Date Input component
 * Date input with an interactive calendar button at inline-end that opens the native date picker.
 * Fixed width (sm) — not configurable, as date inputs have a predictable content width.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DateInput />
 *
 * // With label
 * <FormFieldLabel htmlFor="date">Datum</FormFieldLabel>
 * <DateInput id="date" />
 *
 * // With default value
 * <DateInput defaultValue="2025-03-15" />
 *
 * // Invalid state
 * <DateInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, invalid, disabled, readOnly, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge external ref with internal ref
    const handleRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref]
    );

    const handleButtonClick = () => {
      if (inputRef.current && 'showPicker' in inputRef.current) {
        inputRef.current.showPicker();
      }
    };

    const inputClasses = classNames(
      'dsn-text-input',
      'dsn-date-input',
      className
    );

    return (
      <div className="dsn-date-input-wrapper">
        <input
          ref={handleRef}
          type="date"
          className={inputClasses}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
        {!disabled && !readOnly && (
          <Button
            variant="subtle"
            size="small"
            iconOnly
            iconStart={<Icon name="calendar-event" aria-hidden />}
            className="dsn-date-input__button"
            onClick={handleButtonClick}
          >
            Datumkiezer openen
          </Button>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
