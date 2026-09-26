import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelephoneInput } from './TelephoneInput';

describe('TelephoneInput', () => {
  it('renders as an input element', () => {
    render(<TelephoneInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has tel type', () => {
    render(<TelephoneInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
  });

  it('has tel inputmode', () => {
    render(<TelephoneInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'tel');
  });

  it('has tel autocomplete by default', () => {
    render(<TelephoneInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autocomplete', 'tel');
  });

  it('always has base dsn-text-input class', () => {
    render(<TelephoneInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('applies custom className', () => {
    render(<TelephoneInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TelephoneInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <TelephoneInput
        id="phone"
        placeholder="+31 6 12345678"
        data-testid="input"
      />
    );
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'phone');
    expect(el).toHaveAttribute('placeholder', '+31 6 12345678');
  });

  it('accepts value prop', () => {
    render(
      <TelephoneInput
        value="+31612345678"
        onChange={() => {}}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('input')).toHaveValue('+31612345678');
  });

  it('can be disabled', () => {
    render(<TelephoneInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<TelephoneInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<TelephoneInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('allows autoComplete prop override', () => {
    render(<TelephoneInput autoComplete="off" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autocomplete', 'off');
  });

  describe('inline-size variants', () => {
    it('defaults to md', () => {
      render(<TelephoneInput data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'dsn-text-input--inline-size-md'
      );
    });

    it.each(['md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<TelephoneInput inlineSize={w} data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass(
          `dsn-text-input--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<TelephoneInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<TelephoneInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<TelephoneInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts telephone input', async () => {
      const user = userEvent.setup();
      render(<TelephoneInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, '+31612345678');
      expect(input).toHaveValue('+31612345678');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<TelephoneInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, '0612345678');
      expect(value).toBe('0612345678');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(
        <TelephoneInput aria-describedby="help-text" data-testid="input" />
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<TelephoneInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
