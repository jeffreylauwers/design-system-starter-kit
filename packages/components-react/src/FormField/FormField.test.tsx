import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { TextInput } from '../TextInput';

describe('FormField', () => {
  it('renders as div', () => {
    const { container } = render(
      <FormField label="Test Label" htmlFor="test">
        <TextInput id="test" />
      </FormField>
    );
    expect(container.querySelector('div.dsn-form-field')).toBeInTheDocument();
    expect(container.querySelector('fieldset')).not.toBeInTheDocument();
  });

  it('renders label with htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <TextInput id="email" />
      </FormField>
    );
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('renders label with suffix', () => {
    render(
      <FormField
        label="Optional Field"
        htmlFor="test"
        labelSuffix="(niet verplicht)"
      >
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('Optional Field')).toBeInTheDocument();
    expect(screen.getByText('(niet verplicht)')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <FormField
        label="Test"
        htmlFor="test"
        description="This is a description"
      >
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <FormField label="Test" htmlFor="test" error="This field is required">
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders status message', () => {
    render(
      <FormField label="Test" htmlFor="test" status="280 characters remaining">
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('280 characters remaining')).toBeInTheDocument();
  });

  it('creates description id when htmlFor and description provided', () => {
    render(
      <FormField label="Test" htmlFor="test" description="Help text">
        <TextInput id="test" />
      </FormField>
    );
    const descriptionEl = screen.getByText('Help text');
    expect(descriptionEl).toHaveAttribute('id', 'test-description');
  });

  it('renders children', () => {
    render(
      <FormField label="Test" htmlFor="test">
        <TextInput id="test" placeholder="Enter text" />
      </FormField>
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormField label="Test" htmlFor="test" className="custom-class">
        <TextInput id="test" />
      </FormField>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('forwards ref to div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <FormField label="Test" htmlFor="test" ref={ref}>
        <TextInput id="test" />
      </FormField>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('adds invalid modifier class when error is present', () => {
    const { container } = render(
      <FormField label="Test" htmlFor="test" error="Error message">
        <TextInput id="test" />
      </FormField>
    );
    expect(
      container.querySelector('.dsn-form-field--invalid')
    ).toBeInTheDocument();
  });

  // ===========================================================================
  // ARIA-DESCRIBEDBY KOPPELING (issue #317)
  // ===========================================================================

  it('links the description to the control via aria-describedby', () => {
    render(
      <FormField label="Test" htmlFor="test" description="Help text">
        <TextInput id="test" />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-description');
    expect(input).toHaveAccessibleDescription('Help text');
  });

  it('links the error message to the control via aria-describedby', () => {
    render(
      <FormField label="Test" htmlFor="test" error="Error message">
        <TextInput id="test" invalid />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
    expect(input).toHaveAccessibleDescription('Error message');
  });

  it('links the status message to the control via aria-describedby', () => {
    render(
      <FormField label="Test" htmlFor="test" status="Status message">
        <TextInput id="test" />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-status');
    expect(input).toHaveAccessibleDescription('Status message');
  });

  it('links description, error and status in visual order', () => {
    render(
      <FormField
        label="Test"
        htmlFor="test"
        description="Help text"
        error="Error message"
        status="Status message"
      >
        <TextInput id="test" invalid />
      </FormField>
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'test-description test-error test-status'
    );
  });

  it('sets no aria-describedby when there is no extra text', () => {
    render(
      <FormField label="Test" htmlFor="test">
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('preserves an aria-describedby the consumer set on the control', () => {
    render(
      <>
        <FormField label="Test" htmlFor="test" description="Help text">
          <TextInput id="test" aria-describedby="extern" />
        </FormField>
        <p id="extern">Externe uitleg</p>
      </>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'test-description extern'
    );
    expect(input).toHaveAccessibleDescription('Help text Externe uitleg');
  });

  it('still links the description when htmlFor is omitted', () => {
    render(
      <FormField label="Test" description="Help text">
        <TextInput />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'Help text'
    );
  });

  it('does not make the status a live region by default', () => {
    render(
      <FormField label="Test" htmlFor="test" status="Status message">
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('Status message')).not.toHaveAttribute('aria-live');
  });

  it('makes the status a live region when statusLive is set', () => {
    render(
      <FormField label="Test" htmlFor="test" status="1 van 500" statusLive>
        <TextInput id="test" />
      </FormField>
    );
    expect(screen.getByText('1 van 500')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });

  it('renders without crashing when children is not a single element', () => {
    render(
      <FormField label="Test" htmlFor="test" description="Help text">
        <>
          <TextInput id="test" />
          <TextInput id="test-2" />
        </>
      </FormField>
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getByText('Help text')).toHaveAttribute(
      'id',
      'test-description'
    );
  });
});
