import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

describe('Radio', () => {
  it('renders as a radio input', () => {
    render(<Radio data-testid="radio" />);
    const input = screen.getByTestId('radio');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'radio');
  });

  it('renders as a div wrapper', () => {
    const { container } = render(<Radio data-testid="radio" />);
    const wrapper = container.querySelector('.dsn-radio');
    expect(wrapper?.tagName).toBe('DIV');
  });

  it('renders control element with inner circle', () => {
    const { container } = render(<Radio />);
    const control = container.querySelector('.dsn-radio__control');
    const innerCircle = container.querySelector('.dsn-radio__inner-circle');
    expect(control).toBeInTheDocument();
    expect(innerCircle).toBeInTheDocument();
  });

  it('always has base dsn-radio__input class', () => {
    render(<Radio data-testid="radio" />);
    expect(screen.getByTestId('radio')).toHaveClass('dsn-radio__input');
  });

  it('applies custom className to input', () => {
    render(<Radio className="custom" data-testid="radio" />);
    const el = screen.getByTestId('radio');
    expect(el).toHaveClass('dsn-radio__input');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Radio ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });

  it('spreads additional HTML attributes', () => {
    render(<Radio id="option-a" name="choice" value="a" data-testid="radio" />);
    const el = screen.getByTestId('radio');
    expect(el).toHaveAttribute('id', 'option-a');
    expect(el).toHaveAttribute('name', 'choice');
    expect(el).toHaveAttribute('value', 'a');
  });

  it('can be checked', () => {
    render(<Radio checked onChange={() => {}} data-testid="radio" />);
    expect(screen.getByTestId('radio')).toBeChecked();
  });

  it('can be unchecked', () => {
    render(<Radio checked={false} onChange={() => {}} data-testid="radio" />);
    expect(screen.getByTestId('radio')).not.toBeChecked();
  });

  it('can be disabled', () => {
    render(<Radio disabled data-testid="radio" />);
    expect(screen.getByTestId('radio')).toBeDisabled();
  });

  it('can be required', () => {
    render(<Radio required data-testid="radio" />);
    expect(screen.getByTestId('radio')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<Radio invalid data-testid="radio" />);
      expect(screen.getByTestId('radio')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('adds invalid class when invalid prop is true', () => {
      render(<Radio invalid data-testid="radio" />);
      expect(screen.getByTestId('radio')).toHaveClass(
        'dsn-radio__input--invalid'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<Radio invalid={false} data-testid="radio" />);
      expect(screen.getByTestId('radio')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<Radio data-testid="radio" />);
      expect(screen.getByTestId('radio')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('can be selected by clicking', async () => {
      const user = userEvent.setup();
      render(<Radio data-testid="radio" />);
      const radio = screen.getByTestId('radio') as HTMLInputElement;

      expect(radio.checked).toBe(false);
      await user.click(radio);
      expect(radio.checked).toBe(true);
    });

    it('calls onChange handler when selected', async () => {
      const user = userEvent.setup();
      let checked = false;
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        checked = e.target.checked;
      };

      render(<Radio onChange={handleChange} data-testid="radio" />);
      const radio = screen.getByTestId('radio');

      await user.click(radio);
      expect(checked).toBe(true);
    });

    it('works in a radio group', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Radio name="choice" value="a" data-testid="radio-a" />
          <Radio name="choice" value="b" data-testid="radio-b" />
        </div>
      );
      const radioA = screen.getByTestId('radio-a') as HTMLInputElement;
      const radioB = screen.getByTestId('radio-b') as HTMLInputElement;

      await user.click(radioA);
      expect(radioA.checked).toBe(true);
      expect(radioB.checked).toBe(false);

      await user.click(radioB);
      expect(radioA.checked).toBe(false);
      expect(radioB.checked).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<Radio aria-describedby="help-text" data-testid="radio" />);
      expect(screen.getByTestId('radio')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<Radio aria-labelledby="label-id" data-testid="radio" />);
      expect(screen.getByTestId('radio')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });

    it('control has aria-hidden', () => {
      const { container } = render(<Radio />);
      const control = container.querySelector('.dsn-radio__control');
      expect(control).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
