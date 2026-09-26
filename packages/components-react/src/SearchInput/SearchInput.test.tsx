import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders a wrapper div', () => {
    const { container } = render(<SearchInput data-testid="input" />);
    expect(
      container.querySelector('.dsn-search-input-wrapper')
    ).toBeInTheDocument();
  });

  it('renders an input element inside wrapper', () => {
    render(<SearchInput data-testid="input" />);
    expect(screen.getByTestId('input').tagName).toBe('INPUT');
  });

  it('has search type', () => {
    render(<SearchInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'search');
  });

  it('renders search icon', () => {
    const { container } = render(<SearchInput />);
    const icon = container.querySelector('.dsn-search-input__icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('dsn-icon');
  });

  it('search icon is hidden from screen readers', () => {
    const { container } = render(<SearchInput />);
    const icon = container.querySelector('.dsn-search-input__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('always has base dsn-text-input class on input', () => {
    render(<SearchInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-text-input');
  });

  it('always has dsn-search-input class on input', () => {
    render(<SearchInput data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('dsn-search-input');
  });

  it('applies custom className to input', () => {
    render(<SearchInput className="custom" data-testid="input" />);
    const el = screen.getByTestId('input');
    expect(el).toHaveClass('dsn-text-input');
    expect(el).toHaveClass('dsn-search-input');
    expect(el).toHaveClass('custom');
  });

  describe('inline-size variants', () => {
    it.each(['md', 'lg', 'xl', 'full'] as const)(
      'applies inline-size class to wrapper for %s',
      (w) => {
        const { container } = render(<SearchInput inlineSize={w} />);
        expect(
          container.querySelector('.dsn-search-input-wrapper')
        ).toHaveClass(`dsn-search-input-wrapper--inline-size-${w}`);
      }
    );
  });

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<SearchInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('spreads additional HTML attributes to input', () => {
    render(
      <SearchInput id="search" placeholder="Search..." data-testid="input" />
    );
    const el = screen.getByTestId('input');
    expect(el).toHaveAttribute('id', 'search');
    expect(el).toHaveAttribute('placeholder', 'Search...');
  });

  it('accepts value prop', () => {
    render(
      <SearchInput
        value="search query"
        onChange={() => {}}
        data-testid="input"
      />
    );
    expect(screen.getByTestId('input')).toHaveValue('search query');
  });

  it('can be disabled', () => {
    render(<SearchInput disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('can be read-only', () => {
    render(<SearchInput readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('can be required', () => {
    render(<SearchInput required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  describe('invalid state', () => {
    it('sets aria-invalid when invalid prop is true', () => {
      render(<SearchInput invalid data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when invalid prop is false', () => {
      render(<SearchInput invalid={false} data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid by default', () => {
      render(<SearchInput data-testid="input" />);
      expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('user interaction', () => {
    it('accepts search input', async () => {
      const user = userEvent.setup();
      render(<SearchInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'search term');
      expect(input).toHaveValue('search term');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value;
      };

      render(<SearchInput onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');

      await user.type(input, 'query');
      expect(value).toBe('query');
    });
  });

  describe('accessibility', () => {
    it('can have aria-describedby', () => {
      render(<SearchInput aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('can have aria-labelledby', () => {
      render(<SearchInput aria-labelledby="label-id" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-labelledby',
        'label-id'
      );
    });
  });
});
