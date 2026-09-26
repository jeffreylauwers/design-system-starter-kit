import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  it('renders as an input element', () => {
    render(<NumberInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has text type with numeric inputmode by default', () => {
    render(<NumberInput data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  it('has pattern [0-9]* by default', () => {
    render(<NumberInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[0-9]*');
  });

  it('has autocomplete off by default', () => {
    render(<NumberInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autocomplete', 'off');
  });

  it('always has base dsn-text-input class', () => {
    render(<NumberInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('applies custom className', () => {
    render(<NumberInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<NumberInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes', () => {
    render(<NumberInput id="amount" placeholder="0,00" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'amount');
    expect(el).toHaveAttribute('placeholder', '0,00');
  });

  it('accepts value prop', () => {
    render(
      <NumberInput value="123,45" onChange={() => {}} data-testid="input" />
    );
    expect(screen.getByTestId('input')).toHaveValue('123,45');
  });

  it('can be disabled', () => {
    render(<NumberInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<NumberInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<NumberInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('allowDecimals prop', () => {
    it('uses decimal inputmode when allowDecimals is true', () => {
      render(<NumberInput allowDecimals data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'inputmode',
        'decimal'
      );
    });

    it('does not set pattern when allowDecimals is true', () => {
      render(<NumberInput allowDecimals data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('pattern');
    });

    it('uses numeric inputmode when allowDecimals is false', () => {
      render(<NumberInput allowDecimals={false} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'inputmode',
        'numeric'
      );
    });

    it('sets pattern [0-9]* when allowDecimals is false', () => {
      render(<NumberInput allowDecimals={false} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('inline-size variants', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<NumberInput inlineSize={w} data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass(
          `dsn-text-input--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<NumberInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<NumberInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<NumberInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts numeric input', async () => {
      const user = userEvent.setup();
      render(<NumberInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, '123,45');
      expect(input).toHaveValue('123,45');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<NumberInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, '42');
      expect(value).toBe('42');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<NumberInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<NumberInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
