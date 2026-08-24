import React, { useId } from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { FormFieldLegend } from '../FormFieldLegend';
import { FormFieldDescription } from '../FormFieldDescription';
import { FormFieldErrorMessage } from '../FormFieldErrorMessage';
import { FormFieldStatus, FormFieldStatusVariant } from '../FormFieldStatus';
import './FormFieldset.css';

export interface FormFieldsetProps {
  /**
   * The legend text for the fieldset
   */
  legend: string;

  /**
   * Optional suffix for the legend (e.g., "(niet verplicht)" or "(verplicht)")
   */
  legendSuffix?: string;

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
   * Only enable this for status text that changes during interaction.
   * @default false
   */
  statusLive?: boolean;

  /**
   * Optional ID for the fieldset. Used as the base for the generated
   * description/error/status IDs. Generated via useId() when omitted.
   */
  id?: string;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * The form control element (CheckboxGroup, RadioGroup, DateInputGroup, etc.)
   */
  children: React.ReactNode;
}

/**
 * Form Fieldset component
 * Container that combines FormFieldLegend, FormFieldDescription, Control, FormFieldErrorMessage, and FormFieldStatus
 * Uses fieldset/legend structure for group controls (CheckboxGroup, RadioGroup, DateInputGroup)
 *
 * Description, error and status are linked via aria-describedby on the fieldset
 * itself: a group has no single control to hang the association on.
 *
 * @example
 * ```tsx
 * // Checkbox group
 * <FormFieldset legend="Interesses" description="Selecteer minimaal één interesse">
 *   <CheckboxGroup>
 *     <CheckboxOption label="Sport" value="sport" />
 *     <CheckboxOption label="Muziek" value="music" />
 *     <CheckboxOption label="Reizen" value="travel" />
 *   </CheckboxGroup>
 * </FormFieldset>
 *
 * // Radio group with error
 * <FormFieldset
 *   legend="Geslacht"
 *   legendSuffix="(verplicht)"
 *   error="Selecteer een optie"
 * >
 *   <RadioGroup>
 *     <RadioOption name="gender" label="Man" value="male" />
 *     <RadioOption name="gender" label="Vrouw" value="female" />
 *     <RadioOption name="gender" label="Anders" value="other" />
 *   </RadioGroup>
 * </FormFieldset>
 *
 * // With status
 * <FormFieldset
 *   legend="Voorkeuren"
 *   status="Minimaal 2 opties vereist"
 *   statusVariant="warning"
 * >
 *   <CheckboxGroup>
 *     <CheckboxOption label="E-mail" value="email" />
 *     <CheckboxOption label="SMS" value="sms" />
 *     <CheckboxOption label="Push" value="push" />
 *   </CheckboxGroup>
 * </FormFieldset>
 * ```
 */
export const FormFieldset = React.forwardRef<
  HTMLFieldSetElement,
  FormFieldsetProps
>(
  (
    {
      legend,
      legendSuffix,
      description,
      error,
      status,
      statusVariant = 'default',
      statusLive = false,
      id,
      className,
      children,
    },
    ref
  ) => {
    const generatedId = useId();
    const idBase = id ?? generatedId;

    const descriptionId = description ? `${idBase}-description` : undefined;
    const errorId = error ? `${idBase}-error` : undefined;
    const statusId = status ? `${idBase}-status` : undefined;

    // Bij een groep controls hangt de koppeling aan het fieldset zelf: er is
    // geen enkele control om hem aan te hangen. De volgorde volgt de visuele
    // volgorde, zodat een screenreader dezelfde route loopt als het oog.
    const describedBy =
      [descriptionId, errorId, statusId].filter(Boolean).join(' ') || undefined;

    const containerClasses = classNames(
      'dsn-form-field',
      {
        'dsn-form-field--invalid': !!error,
      },
      className
    );

    return (
      <fieldset
        ref={ref}
        id={id}
        className={containerClasses}
        aria-describedby={describedBy}
      >
        <FormFieldLegend suffix={legendSuffix}>{legend}</FormFieldLegend>

        {description && (
          <FormFieldDescription id={descriptionId}>
            {description}
          </FormFieldDescription>
        )}

        {error && (
          <FormFieldErrorMessage id={errorId}>{error}</FormFieldErrorMessage>
        )}

        {children}

        {status && (
          <FormFieldStatus
            id={statusId}
            variant={statusVariant}
            live={statusLive}
          >
            {status}
          </FormFieldStatus>
        )}
      </fieldset>
    );
  }
);

FormFieldset.displayName = 'FormFieldset';
