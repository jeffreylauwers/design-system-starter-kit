import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateInput } from './DateInput';

describe('DateInput', () => {
  it('renders a wrapper div', () => {
    const { container } = render(<DateInput data-testid="input" />);
    expect(
      container.querySelector('.dsn-date-input-wrapper')
    ).toBeInTheDocument();
  });

  it('renders an input element inside wrapper', () => {
    render(<DateInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has date type', () => {
    render(<DateInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'date');
  });

  it('always has base dsn-text-input class on input', () => {
    render(<DateInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('always has dsn-date-input class on input', () => {
    render(<DateInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-date-input');
  });

  it('applies custom className to input', () => {
    render(<DateInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('dsn-date-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<DateInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes to input', () => {
    render(<DateInput id="date" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'date');
  });

  it('accepts value prop', () => {
    render(
      <DateInput value="2025-03-15" onChange={() => {}} data-testid="input" />
    );
    expect(screen.getByTestId('input')).toHaveValue('2025-03-15');
  });

  it('wrapper always has fixed width (no width prop)', () => {
    const { container } = render(<DateInput />);
    const wrapper = container.querySelector('.dsn-date-input-wrapper');
    expect(wrapper?.className).toBe('dsn-date-input-wrapper');
  });

  describe('calendar button', () => {
    it('renders a calendar button', () => {
      const { container } = render(<DateInput />);
      expect(
        container.querySelector('.dsn-date-input__button')
      ).toBeInTheDocument();
    });

    it('calendar button is a Button component (has dsn-button class)', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).toHaveClass('dsn-button');
    });

    it('calendar button uses subtle variant', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).toHaveClass('dsn-button--subtle');
    });

    it('calendar button uses small size', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).toHaveClass('dsn-button--size-small');
    });

    it('calendar button uses icon-only', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).toHaveClass('dsn-button--icon-only');
    });

    it('calendar button has type button', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('calendar button is keyboard accessible (no tabIndex, no aria-hidden)', () => {
      const { container } = render(<DateInput />);
      const button = container.querySelector('.dsn-date-input__button');
      expect(button).not.toHaveAttribute('tabindex');
      expect(button).not.toHaveAttribute('aria-hidden');
    });

    it('calendar button has accessible label via dsn-button__label', () => {
      const { container } = render(<DateInput />);
      const label = container.querySelector('.dsn-button__label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Datumkiezer openen');
    });

    it('does not render calendar button when disabled', () => {
      const { container } = render(<DateInput disabled data-testid="input" />);
      expect(
        container.querySelector('.dsn-date-input__button')
      ).not.toBeInTheDocument();
    });

    it('does not render calendar button when readOnly', () => {
      const { container } = render(<DateInput readOnly data-testid="input" />);
      expect(
        container.querySelector('.dsn-date-input__button')
      ).not.toBeInTheDocument();
    });

    it('calls showPicker on button click when available', async () => {
      const user = userEvent.setup();
      const showPicker = vi.fn();
      const { container } = render(<DateInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      Object.defineProperty(input, 'showPicker', {
        value: showPicker,
        writable: true,
      });
      const button = container.querySelector(
        '.dsn-date-input__button'
      ) as HTMLButtonElement;
      await user.click(button);
      expect(showPicker).toHaveBeenCalledOnce();
    });
  });

  it('can be disabled', () => {
    render(<DateInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<DateInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<DateInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<DateInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<DateInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<DateInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<DateInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<DateInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
