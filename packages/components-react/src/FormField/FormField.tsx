import React, { useId } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { FormFieldLabel } from '../FormFieldLabel';
import { FormFieldDescription } from '../FormFieldDescription';
import { FormFieldErrorMessage } from '../FormFieldErrorMessage';
import { FormFieldStatus, FormFieldStatusVariant } from '../FormFieldStatus';
import { describeControl } from '../utils/describeControl';
import './FormField.css';

export interface FormFieldProps {
  /**
   * The label text for the form field
   */
  label: string;

  /**
   * The ID of the form control. Used for the label's htmlFor and as the base
   * for the generated description/error/status IDs. When omitted, the IDs are
   * generated via useId(), but the label is no longer explicitly linked.
   */
  htmlFor?: string;

  /**
   * Optional suffix for the label (e.g., "(niet verplicht)" or "(verplicht)")
   */
  labelSuffix?: string;

  /**
   * Optional description text
   */
  description?: React.ReactNode;

  /**
   * Optional error message (shows when field is invalid)
   */
  error?: React.ReactNode;

  /**
   * Optional status message
   */
  status?: React.ReactNode;

  /**
   * Status variant (for status message styling)
   * @default 'default'
   */
  statusVariant?: FormFieldStatusVariant;

  /**
   * Announce status changes to screen readers via an aria-live region.
   * Only enable this for status text that changes during interaction,
   * such as a character counter.
   * @default false
   */
  statusLive?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * The form control element (input, textarea, CheckboxGroup, RadioGroup, etc.)
   */
  children: React.ReactNode;
}

/**
 * Form Field component
 * Container that combines FormFieldLabel, FormFieldDescription, Control, FormFieldErrorMessage, and FormFieldStatus
 * Uses div/label structure (for fieldset/legend use FormFieldset component)
 *
 * Description, error and status are linked to the control via aria-describedby.
 * FormField clones the child element to add the attribute, so the child must be
 * a single element that forwards props to its DOM node. An aria-describedby the
 * consumer already set on the control is preserved.
 *
 * @example
 * ```tsx
 * // Text input field
 * <FormField label="E-mailadres" htmlFor="email" description="We sturen hier geen spam naartoe">
 *   <TextInput id="email" type="email" />
 * </FormField>
 *
 * // With error
 * <FormField
 *   label="Wachtwoord"
 *   htmlFor="password"
 *   error="Wachtwoord moet minimaal 8 tekens bevatten"
 * >
 *   <PasswordInput id="password" invalid />
 * </FormField>
 *
 * // With status (character counter): statusLive announces each change
 * <FormField
 *   label="Bio"
 *   htmlFor="bio"
 *   status="280 van 500 karakters gebruikt"
 *   statusLive
 * >
 *   <TextArea id="bio" rows={4} />
 * </FormField>
 *
 * // With positive status
 * <FormField
 *   label="Wachtwoord"
 *   htmlFor="password"
 *   status="Wachtwoord is sterk genoeg"
 *   statusVariant="positive"
 * >
 *   <PasswordInput id="password" />
 * </FormField>
 * ```
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      labelSuffix,
      description,
      error,
      status,
      statusVariant = 'default',
      statusLive = false,
      className,
      children,
    },
    ref
  ) => {
    const generatedId = useId();
    const idBase = htmlFor ?? generatedId;

    const descriptionId = description ? `${idBase}-description` : undefined;
    const errorId = error ? `${idBase}-error` : undefined;
    const statusId = status ? `${idBase}-status` : undefined;

    // Koppel de extra teksten aan de control zelf. De volgorde volgt de
    // visuele volgorde, zodat een screenreader dezelfde route loopt als het oog.
    const control = describeControl(children, [
      descriptionId,
      errorId,
      statusId,
    ]);

    const containerClasses = classNames(
      'dsn-form-field',
      {
        'dsn-form-field--invalid': !!error,
      },
      className
    );

    return (
      <div ref={ref} className={containerClasses}>
        <FormFieldLabel htmlFor={htmlFor} suffix={labelSuffix}>
          {label}
        </FormFieldLabel>

        {description && (
          <FormFieldDescription id={descriptionId}>
            {description}
          </FormFieldDescription>
        )}

        {error && (
          <FormFieldErrorMessage id={errorId}>{error}</FormFieldErrorMessage>
        )}

        {control}

        {status && (
          <FormFieldStatus
            id={statusId}
            variant={statusVariant}
            live={statusLive}
          >
            {status}
          </FormFieldStatus>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
