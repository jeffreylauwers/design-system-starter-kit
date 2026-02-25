import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeInput } from './TimeInput';

describe('TimeInput', () => {
  it('renders a wrapper div', () => {
    const { container } = render(<TimeInput data-testid="input" />);
    expect(
      container.querySelector('.dsn-time-input-wrapper')
    ).toBeInTheDocument();
  });

  it('renders an input element inside wrapper', () => {
    render(<TimeInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has time type', () => {
    render(<TimeInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'time');
  });

  it('always has base dsn-text-input class on input', () => {
    render(<TimeInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('always has dsn-time-input class on input', () => {
    render(<TimeInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-time-input');
  });

  it('applies custom className to input', () => {
    render(<TimeInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('dsn-time-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TimeInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes to input', () => {
    render(<TimeInput id="time" placeholder="--:--" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'time');
    expect(el).toHaveAttribute('placeholder', '--:--');
  });

  it('accepts value prop', () => {
    render(<TimeInput value="14:30" onChange={() => {}} data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveValue('14:30');
  });

  it('wrapper always has fixed width (no width prop)', () => {
    const { container } = render(<TimeInput />);
    const wrapper = container.querySelector('.dsn-time-input-wrapper');
    expect(wrapper?.className).toBe('dsn-time-input-wrapper');
  });

  describe('clock button', () => {
    it('renders a clock button', () => {
      const { container } = render(<TimeInput />);
      expect(
        container.querySelector('.dsn-time-input__button')
      ).toBeInTheDocument();
    });

    it('clock button is a Button component (has dsn-button class)', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).toHaveClass('dsn-button');
    });

    it('clock button uses subtle variant', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).toHaveClass('dsn-button--subtle');
    });

    it('clock button uses small size', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).toHaveClass('dsn-button--size-small');
    });

    it('clock button uses icon-only', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).toHaveClass('dsn-button--icon-only');
    });

    it('clock button has type button', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('clock button is keyboard accessible (no tabIndex, no aria-hidden)', () => {
      const { container } = render(<TimeInput />);
      const button = container.querySelector('.dsn-time-input__button');
      expect(button).not.toHaveAttribute('tabindex');
      expect(button).not.toHaveAttribute('aria-hidden');
    });

    it('clock button has accessible label via dsn-button__label', () => {
      const { container } = render(<TimeInput />);
      const label = container.querySelector('.dsn-button__label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Tijdkiezer openen');
    });

    it('does not render clock button when disabled', () => {
      const { container } = render(<TimeInput disabled data-testid="input" />);
      expect(
        container.querySelector('.dsn-time-input__button')
      ).not.toBeInTheDocument();
    });

    it('does not render clock button when readOnly', () => {
      const { container } = render(<TimeInput readOnly data-testid="input" />);
      expect(
        container.querySelector('.dsn-time-input__button')
      ).not.toBeInTheDocument();
    });

    it('calls showPicker on button click when available', async () => {
      const user = userEvent.setup();
      const showPicker = vi.fn();
      const { container } = render(<TimeInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      Object.defineProperty(input, 'showPicker', {
        value: showPicker,
        writable: true,
      });
      const button = container.querySelector(
        '.dsn-time-input__button'
      ) as HTMLButtonElement;
      await user.click(button);
      expect(showPicker).toHaveBeenCalledOnce();
    });
  });

  it('can be disabled', () => {
    render(<TimeInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<TimeInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<TimeInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<TimeInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<TimeInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<TimeInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts time input', async () => {
      const user = userEvent.setup();
      render(<TimeInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, '15:45');
      expect(input).toHaveValue('15:45');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<TimeInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, '12:00');
      expect(value).toBe('12:00');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<TimeInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<TimeInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
