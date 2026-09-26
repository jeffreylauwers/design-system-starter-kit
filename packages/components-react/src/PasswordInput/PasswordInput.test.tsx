import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('renders as an input element', () => {
    render(<PasswordInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has password type', () => {
    render(<PasswordInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });

  it('has current-password autocomplete by default', () => {
    render(<PasswordInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  it('always has base dsn-text-input class', () => {
    render(<PasswordInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('applies custom className', () => {
    render(<PasswordInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<PasswordInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <PasswordInput
        id="password"
        placeholder="Wachtwoord"
        data-testid="input"
      />
    );
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'password');
    expect(el).toHaveAttribute('placeholder', 'Wachtwoord');
  });

  it('accepts value prop', () => {
    render(
      <PasswordInput
        value="secret123"
        onChange={() => {}}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('input')).toHaveValue('secret123');
  });

  it('can be disabled', () => {
    render(<PasswordInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<PasswordInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<PasswordInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('passwordAutocomplete prop', () => {
    it('uses current-password by default', () => {
      render(<PasswordInput data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'autocomplete',
        'current-password'
      );
    });

    it('accepts new-password', () => {
      render(
        <PasswordInput
          passwordAutocomplete="new-password"
          data-testid="input"
        />
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'autocomplete',
        'new-password'
      );
    });

    it('accepts off', () => {
      render(<PasswordInput passwordAutocomplete="off" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'autocomplete',
        'off'
      );
    });

    it('autoComplete prop overrides passwordAutocomplete', () => {
      render(
        <PasswordInput
          passwordAutocomplete="new-password"
          autoComplete="off"
          data-testid="input"
        />
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'autocomplete',
        'off'
      );
    });
  });

  describe('inline-size variants', () => {
    it.each(['md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<PasswordInput inlineSize={w} data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass(
          `dsn-text-input--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<PasswordInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<PasswordInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<PasswordInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts password input', async () => {
      const user = userEvent.setup();
      render(<PasswordInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'MySecretPass123');
      expect(input).toHaveValue('MySecretPass123');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<PasswordInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'Pass');
      expect(value).toBe('Pass');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(
        <PasswordInput aria-describedby="help-text" data-testid="input" />
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<PasswordInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
