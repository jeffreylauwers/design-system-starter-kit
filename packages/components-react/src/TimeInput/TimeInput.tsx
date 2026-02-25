import React from 'react';
import { classNames } from '@dsn/core';
import { Button } from '../Button';
import { Icon } from '../Icon';
import '../TextInput/TextInput.css';
import './TimeInput.css';

export interface TimeInputProps extends Omit<
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
 * Time Input component
 * Time input with an interactive clock button at inline-end that opens the native time picker.
 * Fixed width (sm) — not configurable, as time inputs have a predictable content width.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TimeInput />
 *
 * // With label
 * <FormFieldLabel htmlFor="time">Tijd</FormFieldLabel>
 * <TimeInput id="time" />
 *
 * // With default value
 * <TimeInput defaultValue="14:30" />
 *
 * // Invalid state
 * <TimeInput invalid aria-invalid="true" aria-describedby="error" />
 * ```
 */
export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
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
      'dsn-time-input',
      className
    );

    return (
      <div className="dsn-time-input-wrapper">
        <input
          ref={handleRef}
          type="time"
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
            iconStart={<Icon name="clock" aria-hidden />}
            className="dsn-time-input__button"
            onClick={handleButtonClick}
          >
            Tijdkiezer openen
          </Button>
        )}
      </div>
    );
  }
);

TimeInput.displayName = 'TimeInput';
