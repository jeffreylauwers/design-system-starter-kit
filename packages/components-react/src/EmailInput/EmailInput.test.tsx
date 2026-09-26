import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailInput } from './EmailInput';

describe('EmailInput', () => {
  it('renders as an input element', () => {
    render(<EmailInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has email type', () => {
    render(<EmailInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
  });

  it('has email inputmode', () => {
    render(<EmailInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'email');
  });

  it('has email autocomplete by default', () => {
    render(<EmailInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute(
      'autocomplete',
      'email'
    );
  });

  it('always has base dsn-text-input class', () => {
    render(<EmailInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('applies custom className', () => {
    render(<EmailInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<EmailInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <EmailInput
        id="email"
        placeholder="example@email.com"
        data-testid="input"
      />
    );
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'email');
    expect(el).toHaveAttribute('placeholder', 'example@email.com');
  });

  it('accepts value prop', () => {
    render(
      <EmailInput
        value="test@example.com"
        onChange={() => {}}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('input')).toHaveValue('test@example.com');
  });

  it('can be disabled', () => {
    render(<EmailInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<EmailInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<EmailInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('allows autoComplete prop override', () => {
    render(<EmailInput autoComplete="off" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autocomplete', 'off');
  });

  describe('inline-size variants', () => {
    it.each(['md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<EmailInput inlineSize={w} data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass(
          `dsn-text-input--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<EmailInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<EmailInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<EmailInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts email input', async () => {
      const user = userEvent.setup();
      render(<EmailInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'user@example.com');
      expect(input).toHaveValue('user@example.com');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<EmailInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'test@test.com');
      expect(value).toBe('test@test.com');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<EmailInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<EmailInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
