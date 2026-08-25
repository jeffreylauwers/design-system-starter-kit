import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import './FormFieldDescription.css';

export interface FormFieldDescriptionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element to render: use 'div' when the description contains block-level
   * content such as a list (a `<ul>` cannot be nested inside a `<p>`)
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
 * Prefer running text. The content of an `aria-describedby` reference is flattened
 * into a single string, so list structure and links lose their meaning: a list is
 * not announced as a list (VoiceOver in Safari skips it altogether) and a link
 * inside a description cannot be reached or activated. Keep links outside the
 * description. A list is allowed when each item is a full sentence; use `as="div"`
 * for it, because a `<ul>` is not valid inside a `<p>`.
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
 * // With a list (requires as="div"; not announced as a list by screen readers)
 * <FormFieldDescription as="div" id="upload-description">
 *   <UnorderedList>
 *     <li>Het bestand mag maximaal 5 MB zijn.</li>
 *     <li>Toegestane bestandstypen: pdf en docx.</li>
 *   </UnorderedList>
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
