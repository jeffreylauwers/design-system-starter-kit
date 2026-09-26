import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('renders a wrapper div', () => {
    const { container } = render(
      <Select data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(container.querySelector('.dsn-select-wrapper')).toBeInTheDocument();
  });

  it('renders a select element inside wrapper', () => {
    render(
      <Select data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select').tagName).toBe('SELECT');
  });

  it('always has base dsn-text-input class on select', () => {
    render(
      <Select data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select')).toHaveClass('dsn-text-input');
  });

  it('always has dsn-select class on select', () => {
    render(
      <Select data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select')).toHaveClass('dsn-select');
  });

  it('applies custom className to select', () => {
    render(
      <Select className="custom" data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    const el = screen.getByTestId('select');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('dsn-select');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref to select element', () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(
      <Select ref={ref}>
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('spreads additional HTML attributes to select', () => {
    render(
      <Select id="my-select" data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select')).toHaveAttribute('id', 'my-select');
  });

  it('renders children (options) inside select', () => {
    render(
      <Select data-testid="select">
        <option value="1">Optie 1</option>
        <option value="2">Optie 2</option>
      </Select>
    );
    const select = screen.getByTestId('select') as HTMLSelectElement;
    expect(select.options).toHaveLength(2);
  });

  describe('chevron icon', () => {
    it('renders a chevron-down icon', () => {
      const { container } = render(
        <Select>
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(container.querySelector('.dsn-select__icon')).toBeInTheDocument();
    });

    it('chevron icon has aria-hidden', () => {
      const { container } = render(
        <Select>
          <option value="1">Optie 1</option>
        </Select>
      );
      const icon = container.querySelector('.dsn-select__icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render chevron icon when disabled', () => {
      const { container } = render(
        <Select disabled>
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(
        container.querySelector('.dsn-select__icon')
      ).not.toBeInTheDocument();
    });
  });

  describe('inline-size variants', () => {
    it('wrapper has no inline-size class by default', () => {
      const { container } = render(
        <Select>
          <option value="1">Optie 1</option>
        </Select>
      );
      const wrapper = container.querySelector('.dsn-select-wrapper');
      expect(wrapper?.className).toBe('dsn-select-wrapper');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size-%s class to wrapper',
      (inlineSize) => {
        const { container } = render(
          <Select inlineSize={inlineSize}>
            <option value="1">Optie 1</option>
          </Select>
        );
        expect(
          container.querySelector(
            `.dsn-select-wrapper--inline-size-${inlineSize}`
          )
        ).toBeInTheDocument();
      }
    );
  });

  it('can be disabled', () => {
    render(
      <Select disabled data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select')).toBeDisabled();
  });

  it('can be required', () => {
    render(
      <Select required data-testid="select">
        <option value="1">Optie 1</option>
      </Select>
    );
    expect(screen.getByTestId('select')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(
        <Select invalid data-testid="select">
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(
        <Select invalid={false} data-testid="select">
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(
        <Select data-testid="select">
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(
        <Select aria-describedby="help-text" data-testid="select">
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(
        <Select aria-labelledby="label-id" data-testid="select">
          <option value="1">Optie 1</option>
        </Select>
      );
      expect(screen.getByTestId('select')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
