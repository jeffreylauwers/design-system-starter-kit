import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioOption } from './RadioOption';

describe('RadioOption', () => {
  it('renders as a label wrapper', () => {
    const { container } = render(
      <RadioOption label="Option A" data-testid="radio" />
    );
    const wrapper = container.querySelector('.dsn-radio-option');
    expect(wrapper?.tagName).toBe('LABEL');
  });

  it('renders radio and label', () => {
    const { container } = render(<RadioOption label="Option A" />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(container.querySelector('.dsn-radio')).toBeInTheDocument();
    expect(container.querySelector('.dsn-option-label')).toBeInTheDocument();
  });

  it('forwards ref to radio input', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<RadioOption ref={ref} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <RadioOption label="Test" className="custom" />
    );
    const wrapper = container.querySelector('.dsn-radio-option');
    expect(wrapper).toHaveClass('custom');
  });

  it('passes props to radio', () => {
    render(
      <RadioOption
        label="Test"
        checked
        onChange={() => {}}
        data-testid="radio"
      />
    );
    expect(screen.getByTestId('radio')).toBeChecked();
  });

  it('can be selected by clicking label', async () => {
    const user = userEvent.setup();
    render(<RadioOption label="Option A" data-testid="radio" />);
    const radio = screen.getByTestId('radio') as HTMLInputElement;
    const label = screen.getByText('Option A');

    expect(radio.checked).toBe(false);
    await user.click(label);
    expect(radio.checked).toBe(true);
  });

  it('applies disabled to both radio and label', () => {
    const { container } = render(
      <RadioOption label="Test" disabled data-testid="radio" />
    );
    expect(screen.getByTestId('radio')).toBeDisabled();
    expect(
      container.querySelector('.dsn-option-label--disabled')
    ).toBeInTheDocument();
  });

  it('supports invalid state', () => {
    render(<RadioOption label="Test" invalid data-testid="radio" />);
    expect(screen.getByTestId('radio')).toHaveAttribute('aria-invalid', 'true');
  });

  it('works in a radio group', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <RadioOption
          label="Option A"
          name="choice"
          value="a"
          data-testid="radio-a"
        />
        <RadioOption
          label="Option B"
          name="choice"
          value="b"
          data-testid="radio-b"
        />
      </div>
    );
    const radioA = screen.getByTestId('radio-a') as HTMLInputElement;
    const radioB = screen.getByTestId('radio-b') as HTMLInputElement;
    const labelA = screen.getByText('Option A');
    const labelB = screen.getByText('Option B');

    await user.click(labelA);
    expect(radioA.checked).toBe(true);
    expect(radioB.checked).toBe(false);

    await user.click(labelB);
    expect(radioA.checked).toBe(false);
    expect(radioB.checked).toBe(true);
  });
});
