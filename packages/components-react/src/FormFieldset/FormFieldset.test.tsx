import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormFieldset } from './FormFieldset';
import { CheckboxGroup } from '../CheckboxGroup';
import { CheckboxOption } from '../CheckboxOption';

const renderGroup = () => (
  <CheckboxGroup>
    <CheckboxOption label="Sport" value="sport" />
    <CheckboxOption label="Muziek" value="music" />
  </CheckboxGroup>
);

describe('FormFieldset', () => {
  it('renders as fieldset with a legend', () => {
    const { container } = render(
      <FormFieldset legend="Interesses">{renderGroup()}</FormFieldset>
    );
    expect(
      container.querySelector('fieldset.dsn-form-field')
    ).toBeInTheDocument();
    const legend = screen.getByText('Interesses');
    expect(legend.tagName).toBe('LEGEND');
  });

  it('renders legend with suffix', () => {
    render(
      <FormFieldset legend="Interesses" legendSuffix="(niet verplicht)">
        {renderGroup()}
      </FormFieldset>
    );
    expect(screen.getByText('(niet verplicht)')).toBeInTheDocument();
  });

  it('renders description, error and status', () => {
    render(
      <FormFieldset
        legend="Interesses"
        description="Help text"
        error="Error message"
        status="Status message"
      >
        {renderGroup()}
      </FormFieldset>
    );
    expect(screen.getByText('Help text')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Status message')).toBeInTheDocument();
  });

  it('adds invalid modifier class when error is present', () => {
    const { container } = render(
      <FormFieldset legend="Interesses" error="Error message">
        {renderGroup()}
      </FormFieldset>
    );
    expect(
      container.querySelector('.dsn-form-field--invalid')
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormFieldset legend="Interesses" className="custom-class">
        {renderGroup()}
      </FormFieldset>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('forwards ref to fieldset', () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    render(
      <FormFieldset legend="Interesses" ref={ref}>
        {renderGroup()}
      </FormFieldset>
    );
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  // ===========================================================================
  // ARIA-DESCRIBEDBY KOPPELING (issue #317)
  // ===========================================================================

  it('links the description to the fieldset via aria-describedby', () => {
    render(
      <FormFieldset legend="Interesses" id="hobbies" description="Help text">
        {renderGroup()}
      </FormFieldset>
    );
    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveAttribute('aria-describedby', 'hobbies-description');
    expect(fieldset).toHaveAccessibleDescription('Help text');
  });

  it('links the error message to the fieldset via aria-describedby', () => {
    render(
      <FormFieldset legend="Interesses" id="hobbies" error="Error message">
        {renderGroup()}
      </FormFieldset>
    );
    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveAttribute('aria-describedby', 'hobbies-error');
    expect(fieldset).toHaveAccessibleDescription('Error message');
  });

  it('links description, error and status in visual order', () => {
    render(
      <FormFieldset
        legend="Interesses"
        id="hobbies"
        description="Help text"
        error="Error message"
        status="Status message"
      >
        {renderGroup()}
      </FormFieldset>
    );
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-describedby',
      'hobbies-description hobbies-error hobbies-status'
    );
  });

  it('still links the description when id is omitted', () => {
    render(
      <FormFieldset legend="Interesses" description="Help text">
        {renderGroup()}
      </FormFieldset>
    );
    const fieldset = screen.getByRole('group');
    const describedBy = fieldset.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'Help text'
    );
  });

  it('sets no aria-describedby when there is no extra text', () => {
    render(<FormFieldset legend="Interesses">{renderGroup()}</FormFieldset>);
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-describedby');
  });

  it('makes the status a live region when statusLive is set', () => {
    render(
      <FormFieldset legend="Interesses" status="1 van 3 gekozen" statusLive>
        {renderGroup()}
      </FormFieldset>
    );
    expect(screen.getByText('1 van 3 gekozen')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });
});
