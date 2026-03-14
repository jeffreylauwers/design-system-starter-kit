import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckboxOption } from './CheckboxOption';

describe('CheckboxOption', () => {
  it('renders as a label wrapper', () => {
    const { container } = render(
      <CheckboxOption label="Accept" data-testid="checkbox" />
    );
    const wrapper = container.querySelector('.dsn-checkbox-option');
    expect(wrapper?.tagName).toBe('LABEL');
  });

  it('renders checkbox and label', () => {
    const { container } = render(<CheckboxOption label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(container.querySelector('.dsn-checkbox')).toBeInTheDocument();
    expect(container.querySelector('.dsn-option-label')).toBeInTheDocument();
  });

  it('forwards ref to checkbox input', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<CheckboxOption ref={ref} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <CheckboxOption label="Test" className="custom" />
    );
    const wrapper = container.querySelector('.dsn-checkbox-option');
    expect(wrapper).toHaveClass('custom');
  });

  it('passes props to checkbox', () => {
    render(
      <CheckboxOption
        label="Test"
        checked
        onChange={() => {}}
        data-testid="checkbox"
      />
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('can be toggled by clicking label', async () => {
    const user = userEvent.setup();
    render(<CheckboxOption label="Accept" data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    const label = screen.getByText('Accept');

    expect(checkbox.checked).toBe(false);
    await user.click(label);
    expect(checkbox.checked).toBe(true);
  });

  it('applies disabled to both checkbox and label', () => {
    const { container } = render(
      <CheckboxOption label="Test" disabled data-testid="checkbox" />
    );
    expect(screen.getByTestId('checkbox')).toBeDisabled();
    expect(
      container.querySelector('.dsn-option-label--disabled')
    ).toBeInTheDocument();
  });

  it('supports invalid state', () => {
    render(<CheckboxOption label="Test" invalid data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('supports indeterminate state', () => {
    render(
      <CheckboxOption label="Test" indeterminate data-testid="checkbox" />
    );
    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
});
