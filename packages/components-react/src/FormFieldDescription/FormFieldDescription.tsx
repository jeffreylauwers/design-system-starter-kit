import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './FormFieldDescription.css';

export interface FormFieldDescriptionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element to render: use 'div' when the description contains block-level
   * content, which a `<p>` cannot hold. Note that block-level content in a
   * description is discouraged, see the component docs.
   * @default 'p'
   */
  as?: 'p' | 'div';

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Description content
   */
  children?: React.ReactNode;
}

/**
 * Form Field Description component
 * Optional help text displayed below the label and above the form control.
 *
 * Use running text only. The content of an `aria-describedby` reference is
 * flattened into a single string, so list structure and links lose their meaning.
 * VoiceOver in Safari does not read a list inside a description at all, and a link
 * inside a description cannot be reached or activated. Put a list or a link outside
 * the description: a list as ordinary content above the form field, where it keeps
 * its list semantics.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FormFieldDescription>
 *   Vul hier uw officiële voornaam in zoals deze op uw paspoort staat.
 * </FormFieldDescription>
 *
 * // With ID for aria-describedby
 * <FormFieldDescription id="email-description">
 *   We gebruiken uw e-mailadres alleen voor accountgerelateerde berichten.
 * </FormFieldDescription>
 *
 * // Several requirements: running text, not a list
 * <FormFieldDescription id="upload-description">
 *   Het bestand mag maximaal 5 MB zijn. Toegestane bestandstypen: pdf en docx.
 * </FormFieldDescription>
 * ```
 */
export const FormFieldDescription = React.forwardRef<
  HTMLElement,
  FormFieldDescriptionProps
>(({ as: As = 'p', className, children, ...props }, ref) => {
  const classes = classNames('dsn-form-field-description', className);

  return (
    <As
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={classes}
      {...props}
    >
      {children}
    </As>
  );
});

FormFieldDescription.displayName = 'FormFieldDescription';
