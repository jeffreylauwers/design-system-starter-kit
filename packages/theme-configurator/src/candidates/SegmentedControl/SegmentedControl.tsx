import { useId } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './segmented-control.css';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  /** Name of the group, shown as the legend. */
  legend: string;
  /** Hide the legend visually; screen readers still announce it. */
  hideLegend?: boolean;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Radio group name; generated when omitted. */
  name?: string;
  className?: string;
}

/**
 * One choice out of a few options, shown as connected buttons. Native radio
 * buttons in a fieldset: arrow keys, the group name and the selected state
 * come from the browser.
 *
 * Candidate component: see README.md.
 */
export function SegmentedControl<T extends string>({
  legend,
  hideLegend = false,
  options,
  value,
  onChange,
  name,
  className,
}: SegmentedControlProps<T>) {
  const generatedId = useId();
  const groupName = name ?? generatedId;

  return (
    <fieldset className={classNames('dsn-segmented-control', className)}>
      <legend
        className={classNames(
          'dsn-segmented-control__legend',
          hideLegend && 'dsn-visually-hidden'
        )}
      >
        {legend}
      </legend>
      <div className="dsn-segmented-control__options">
        {options.map((option) => (
          <label key={option.value} className="dsn-segmented-control__option">
            <input
              className="dsn-segmented-control__input"
              type="radio"
              name={groupName}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span className="dsn-segmented-control__label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
