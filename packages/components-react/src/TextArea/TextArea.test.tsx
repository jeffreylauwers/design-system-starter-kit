import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders as a textarea element', () => {
    render(<TextArea data-testid="textarea" />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('has 4 rows by default', () => {
    render(<TextArea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '4');
  });

  it('accepts custom rows', () => {
    render(<TextArea rows={10} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '10');
  });

  it('always has base dsn-text-area class', () => {
    render(<TextArea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('dsn-text-area');
  });

  it('applies custom className', () => {
    render(<TextArea className="custom" data-testid="textarea" />);
    const el = screen.getByTestId('textarea');
    expect(el).toHaveClass('dsn-text-area');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<TextArea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <TextArea id="bio" placeholder="Enter bio" data-testid="textarea" />
    );
    const el = screen.getByTestId('textarea');
    expect(el).toHaveAttribute('id', 'bio');
    expect(el).toHaveAttribute('placeholder', 'Enter bio');
  });

  it('accepts value prop', () => {
    render(
      <TextArea value="Test value" onChange={() => {}} data-testid="textarea" />
    );
    expect(screen.getByTestId('textarea')).toHaveValue('Test value');
  });

  it('accepts placeholder', () => {
    render(<TextArea placeholder="Enter text" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute(
      'placeholder',
      'Enter text'
    );
  });

  it('can be disabled', () => {
    render(<TextArea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<TextArea readOnly data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<TextArea required data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeRequired();
  });

  describe('inline-size variants', () => {
    it.each(['md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class for %s',
      (w) => {
        render(<TextArea inlineSize={w} data-testid="textarea" />);
        expect(screen.getByTestId('textarea')).toHaveClass(
          `dsn-text-area--inline-size-${w}`
        );
      }
    );
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<TextArea invalid data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<TextArea invalid={false} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).not.toHaveAttribute(
        'aria-invalid'
      );
    });

    it('does not set aria-invalid by default', () => {
      render(<TextArea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).not.toHaveAttribute(
        'aria-invalid'
      );
    });
  });

  describe('user interaction', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<TextArea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

      await user.type(textarea, 'Hello World');
      expect(textarea).toHaveValue('Hello World');
    });

    it('accepts multi-line input', async () => {
      const user = userEvent.setup();
      render(<TextArea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

      await user.type(textarea, 'Line 1{Enter}Line 2');
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        value = e.target.value;
      };

      render(<TextArea onChange={handleChange} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, 'Test');
      expect(value).toBe('Test');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<TextArea aria-describedby="help-text" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<TextArea aria-labelledby="label-id" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
