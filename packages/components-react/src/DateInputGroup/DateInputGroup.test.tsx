import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateInputGroup } from './DateInputGroup';

const emptyValue = { day: '', month: '', year: '' };

describe('DateInputGroup', () => {
  it('renders a wrapper div with dsn-date-input-group class', () => {
    const { container } = render(<DateInputGroup value={emptyValue} />);
    expect(
      container.querySelector('.dsn-date-input-group')
    ).toBeInTheDocument();
  });

  it('forwards ref to wrapper div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<DateInputGroup ref={ref} value={emptyValue} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <DateInputGroup className="custom" value={emptyValue} />
    );
    const wrapper = container.querySelector('.dsn-date-input-group');
    expect(wrapper).toHaveClass('custom');
  });

  it('spreads additional HTML attributes to wrapper', () => {
    const { container } = render(
      <DateInputGroup data-testid="group" value={emptyValue} />
    );
    expect(
      container.querySelector('[data-testid="group"]')
    ).toBeInTheDocument();
  });

  describe('renders three fields', () => {
    it('renders a Dag label', () => {
      render(<DateInputGroup value={emptyValue} />);
      expect(screen.getByText('Dag')).toBeInTheDocument();
    });

    it('renders a Maand label', () => {
      render(<DateInputGroup value={emptyValue} />);
      expect(screen.getByText('Maand')).toBeInTheDocument();
    });

    it('renders a Jaar label', () => {
      render(<DateInputGroup value={emptyValue} />);
      expect(screen.getByText('Jaar')).toBeInTheDocument();
    });

    it('renders three inputs', () => {
      render(<DateInputGroup value={emptyValue} />);
      expect(screen.getAllByRole('textbox')).toHaveLength(3);
    });
  });

  describe('id prop', () => {
    it('generates correct ids for each field when id is provided', () => {
      render(<DateInputGroup id="geboortedatum" value={emptyValue} />);
      expect(screen.getByLabelText('Dag')).toHaveAttribute(
        'id',
        'geboortedatum-dag'
      );
      expect(screen.getByLabelText('Maand')).toHaveAttribute(
        'id',
        'geboortedatum-maand'
      );
      expect(screen.getByLabelText('Jaar')).toHaveAttribute(
        'id',
        'geboortedatum-jaar'
      );
    });

    it('labels are connected to inputs via htmlFor when id is provided', () => {
      render(<DateInputGroup id="geboortedatum" value={emptyValue} />);
      expect(screen.getByLabelText('Dag')).toBeInTheDocument();
      expect(screen.getByLabelText('Maand')).toBeInTheDocument();
      expect(screen.getByLabelText('Jaar')).toBeInTheDocument();
    });
  });

  describe('value prop', () => {
    it('shows day value in dag input', () => {
      render(
        <DateInputGroup id="test" value={{ day: '15', month: '', year: '' }} />
      );
      expect(screen.getByLabelText('Dag')).toHaveValue('15');
    });

    it('shows month value in maand input', () => {
      render(
        <DateInputGroup id="test" value={{ day: '', month: '03', year: '' }} />
      );
      expect(screen.getByLabelText('Maand')).toHaveValue('03');
    });

    it('shows year value in jaar input', () => {
      render(
        <DateInputGroup
          id="test"
          value={{ day: '', month: '', year: '1990' }}
        />
      );
      expect(screen.getByLabelText('Jaar')).toHaveValue('1990');
    });
  });

  describe('onChange', () => {
    it('calls onChange with updated day when dag input changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateInputGroup
          id="test"
          value={{ day: '', month: '03', year: '1990' }}
          onChange={onChange}
        />
      );
      await user.type(screen.getByLabelText('Dag'), '15');
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ month: '03', year: '1990' });
    });

    it('calls onChange with updated month when maand input changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateInputGroup
          id="test"
          value={{ day: '15', month: '', year: '1990' }}
          onChange={onChange}
        />
      );
      await user.type(screen.getByLabelText('Maand'), '3');
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ day: '15', year: '1990' });
    });

    it('calls onChange with updated year when jaar input changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateInputGroup
          id="test"
          value={{ day: '15', month: '03', year: '' }}
          onChange={onChange}
        />
      );
      await user.type(screen.getByLabelText('Jaar'), '1');
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ day: '15', month: '03' });
    });

    it('does not throw when onChange is not provided', async () => {
      const user = userEvent.setup();
      render(<DateInputGroup id="test" value={emptyValue} />);
      await expect(
        user.type(screen.getByLabelText('Dag'), '5')
      ).resolves.not.toThrow();
    });
  });

  describe('invalid state', () => {
    it('sets aria-invalid on all three inputs when invalid is true', () => {
      render(<DateInputGroup id="test" value={emptyValue} invalid />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('does not set aria-invalid by default', () => {
      render(<DateInputGroup id="test" value={emptyValue} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).not.toHaveAttribute('aria-invalid');
      });
    });
  });

  describe('disabled state', () => {
    it('disables all three inputs when disabled is true', () => {
      render(<DateInputGroup id="test" value={emptyValue} disabled />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('inline-size variants', () => {
    it('dag input has xs inline-size class', () => {
      render(<DateInputGroup id="test" value={emptyValue} />);
      expect(screen.getByLabelText('Dag')).toHaveClass(
        'dsn-text-input--inline-size-xs'
      );
    });

    it('maand input has xs inline-size class', () => {
      render(<DateInputGroup id="test" value={emptyValue} />);
      expect(screen.getByLabelText('Maand')).toHaveClass(
        'dsn-text-input--inline-size-xs'
      );
    });

    it('jaar input has sm inline-size class', () => {
      render(<DateInputGroup id="test" value={emptyValue} />);
      expect(screen.getByLabelText('Jaar')).toHaveClass(
        'dsn-text-input--inline-size-sm'
      );
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby on the wrapper', () => {
      render(
        <DateInputGroup
          aria-describedby="help-text"
          data-testid="group"
          value={emptyValue}
        />
      );
      expect(screen.getByTestId('group')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });
  });
});
