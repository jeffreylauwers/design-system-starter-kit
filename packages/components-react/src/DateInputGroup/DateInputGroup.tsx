import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { NumberInput } from '../NumberInput';
import './DateInputGroup.css';

export interface DateInputGroupValue {
  day: string;
  month: string;
  year: string;
}

export interface DateInputGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /**
   * The current value of the date group
   */
  value?: DateInputGroupValue;

  /**
   * Called when any field changes, with the full updated value object
   */
  onChange?: (value: DateInputGroupValue) => void;

  /**
   * Whether all fields are in an invalid state
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether all fields are disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * id prefix used to generate unique ids for each field (dag, maand, jaar)
   * E.g. id="geboortedatum" → "geboortedatum-dag", "geboortedatum-maand", "geboortedatum-jaar"
   */
  id?: string;
}

/**
 * Date Input Group component
 * Three separate inputs for day, month and year.
 * More accessible than a native date picker: works consistently across all browsers and
 * devices, and allows partial input (e.g. year only).
 *
 * Wrap in a FormFieldset for a complete form field with legend and error message.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DateInputGroup
 *   value={{ day: '', month: '', year: '' }}
 *   onChange={(val) => setValue(val)}
 * />
 *
 * // Complete form field
 * <FormFieldset>
 *   <FormFieldLegend>Geboortedatum</FormFieldLegend>
 *   <FormFieldDescription>Bijvoorbeeld: 15 3 1990</FormFieldDescription>
 *   <DateInputGroup
 *     id="geboortedatum"
 *     value={value}
 *     onChange={setValue}
 *   />
 * </FormFieldset>
 *
 * // Invalid state
 * <DateInputGroup invalid value={value} onChange={setValue} />
 * ```
 */
export const DateInputGroup = React.forwardRef<
  HTMLDivElement,
  DateInputGroupProps
>(({ className, value, onChange, invalid, disabled, id, ...props }, ref) => {
  const classes = classNames('dsn-date-input-group', className);

  const handleChange =
    (field: keyof DateInputGroupValue) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({
        day: value?.day ?? '',
        month: value?.month ?? '',
        year: value?.year ?? '',
        [field]: e.target.value,
      });
    };

  const dayId = id ? `${id}-dag` : undefined;
  const monthId = id ? `${id}-maand` : undefined;
  const yearId = id ? `${id}-jaar` : undefined;

  return (
    <div ref={ref} className={classes} {...props}>
      <div className="dsn-date-input-group__field">
        <label className="dsn-date-input-group__label" htmlFor={dayId}>
          Dag
        </label>
        <NumberInput
          id={dayId}
          inlineSize="xs"
          value={value?.day ?? ''}
          onChange={handleChange('day')}
          invalid={invalid}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          placeholder="DD"
          min={1}
          max={31}
        />
      </div>
      <div className="dsn-date-input-group__field">
        <label className="dsn-date-input-group__label" htmlFor={monthId}>
          Maand
        </label>
        <NumberInput
          id={monthId}
          inlineSize="xs"
          value={value?.month ?? ''}
          onChange={handleChange('month')}
          invalid={invalid}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          placeholder="MM"
          min={1}
          max={12}
        />
      </div>
      <div className="dsn-date-input-group__field">
        <label className="dsn-date-input-group__label" htmlFor={yearId}>
          Jaar
        </label>
        <NumberInput
          id={yearId}
          inlineSize="sm"
          value={value?.year ?? ''}
          onChange={handleChange('year')}
          invalid={invalid}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          placeholder="JJJJ"
          min={1}
          max={9999}
        />
      </div>
    </div>
  );
});

DateInputGroup.displayName = 'DateInputGroup';
