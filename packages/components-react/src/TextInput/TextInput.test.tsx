import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders as an input element', () => {
    render(<TextInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has text type by default', () => {
    render(<TextInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
  });

  it('accepts custom type', () => {
    render(<TextInput type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
  });

  it('always has base dsn-text-input class', () => {
    render(<TextInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('applies custom className', () => {
    render(<TextInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <TextInput id="name" placeholder="Enter name" data-testid="input" />
    );
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'name');
    expect(el).toHaveAttribute('placeholder', 'Enter name');
  });

  it('accepts value prop', () => {
    render(
      <TextInput value="Test value" onChange={() => {}} data-testid="input" />
    );
    expect(screen.getByTestId('input')).toHaveValue('Test value');
  });

  it('accepts placeholder', () => {
    render(<TextInput placeholder="Enter text" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute(
      'placeholder',
      'Enter text'
    );
  });

  it('can be disabled', () => {
    render(<TextInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<TextInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<TextInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('inline-size variants', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<TextInput inlineSize={w} data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass(
          `dsn-text-input--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<TextInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<TextInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<TextInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<TextInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<TextInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'Test');
      expect(value).toBe('Test');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<TextInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<TextInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
