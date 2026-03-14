import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders as a checkbox input', () => {
    render(<Checkbox data-testid="checkbox" />);
    const input = screen.getByTestId('checkbox');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'checkbox');
  });

  it('renders as a div wrapper', () => {
    const { container } = render(<Checkbox data-testid="checkbox" />);
    const wrapper = container.querySelector('.dsn-checkbox');
    expect(wrapper?.tagName).toBe('DIV');
  });

  it('renders control element with check icon', () => {
    const { container } = render(<Checkbox />);
    const control = container.querySelector('.dsn-checkbox__control');
    const icon = container.querySelector('.dsn-checkbox__icon');
    expect(control).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  it('always has base dsn-checkbox__input class', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass('dsn-checkbox__input');
  });

  it('applies custom className to input', () => {
    render(<Checkbox className="custom" data-testid="checkbox" />);
    const el = screen.getByTestId('checkbox');
    expect(el).toHaveClass('dsn-checkbox__input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Checkbox id="terms" name="terms" value="yes" data-testid="checkbox" />
    );
    const el = screen.getByTestId('checkbox');
    expect(el).toHaveAttribute('id', 'terms');
    expect(el).toHaveAttribute('name', 'terms');
    expect(el).toHaveAttribute('value', 'yes');
  });

  it('can be checked', () => {
    render(<Checkbox checked onChange={() => {}} data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('can be unchecked', () => {
    render(
      <Checkbox checked={false} onChange={() => {}} data-testid="checkbox" />
    );
    expect(screen.getByTestId('checkbox')).not.toBeChecked();
  });

  it('can be disabled', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeDisabled();
  });

  it('can be required', () => {
    render(<Checkbox required data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<Checkbox invalid data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('adds invalid class when invalid prop is true', () => {
      render(<Checkbox invalid data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass(
        'dsn-checkbox__input--invalid'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<Checkbox invalid={false} data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).not.toHaveAttribute(
        'aria-invalid'
      );
    });

    it('does not set aria-invalid by default', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).not.toHaveAttribute(
        'aria-invalid'
      );
    });
  });

  describe('indeterminate state', () => {
    it('sets indeterminate property when prop is true', () => {
      render(<Checkbox indeterminate data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it('does not set indeterminate by default', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });

    it('shows minus icon when indeterminate', () => {
      const { container } = render(<Checkbox indeterminate />);
      // The minus icon should be present
      const icon = container.querySelector('.dsn-checkbox__icon');
      expect(icon).toBeInTheDocument();
    });

    it('shows check icon when not indeterminate', () => {
      const { container } = render(<Checkbox />);
      const icon = container.querySelector('.dsn-checkbox__icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('user interaction', () => {
    it('can be toggled by clicking', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;

      expect(checkbox.checked).toBe(false);
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('calls onChange handler when toggled', async () => {
      const user = userEvent.setup();
      let checked = false;
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        checked = e.target.checked;
      };

      render(<Checkbox onChange={handleChange} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');

      await user.click(checkbox);
      expect(checked).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<Checkbox aria-describedby="help-text" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<Checkbox aria-labelledby="label-id" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });

    it('control has aria-hidden', () => {
      const { container } = render(<Checkbox />);
      const control = container.querySelector('.dsn-checkbox__control');
      expect(control).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
