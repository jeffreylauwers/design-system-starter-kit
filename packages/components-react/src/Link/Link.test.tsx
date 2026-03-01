import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from './Link';

describe('Link', () => {
  it('renders children', () => {
    render(<Link href="/about">About us</Link>);
    expect(screen.getByRole('link', { name: 'About us' })).toBeInTheDocument();
  });

  it('renders as an anchor element', () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
  });

  it('sets href on the anchor', () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
  });

  it('applies base dsn-link class', () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole('link')).toHaveClass('dsn-link');
  });

  it('applies custom className', () => {
    render(
      <Link href="/about" className="custom">
        About
      </Link>
    );
    expect(screen.getByRole('link')).toHaveClass('dsn-link', 'custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <Link ref={ref} href="/about">
        About
      </Link>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('passes target attribute', () => {
    render(
      <Link href="/about" target="_blank">
        About
      </Link>
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('passes rel attribute', () => {
    render(
      <Link href="/about" rel="noopener noreferrer">
        About
      </Link>
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  describe('disabled state', () => {
    it('sets aria-disabled when disabled', () => {
      render(
        <Link href="/about" disabled>
          About
        </Link>
      );
      expect(screen.getByText('About')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('removes href when disabled', () => {
      render(
        <Link href="/about" disabled>
          About
        </Link>
      );
      expect(screen.getByText('About')).not.toHaveAttribute('href');
    });

    it('sets tabIndex to -1 when disabled', () => {
      render(
        <Link href="/about" disabled>
          About
        </Link>
      );
      expect(screen.getByText('About')).toHaveAttribute('tabindex', '-1');
    });

    it('prevents click when disabled', () => {
      let clicked = false;
      render(
        <Link
          href="/about"
          disabled
          onClick={() => {
            clicked = true;
          }}
        >
          About
        </Link>
      );
      // Use fireEvent since CSS pointer-events: none blocks userEvent
      fireEvent.click(screen.getByText('About'));
      expect(clicked).toBe(false);
    });

    it('does not have aria-disabled when not disabled', () => {
      render(<Link href="/about">About</Link>);
      expect(screen.getByRole('link')).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('current state', () => {
    it('sets aria-current="page" when current', () => {
      render(
        <Link href="/dashboard" current>
          Dashboard
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
    });

    it('does not have aria-current when not current', () => {
      render(<Link href="/about">About</Link>);
      expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
    });
  });

  describe('icon support', () => {
    it('renders iconStart before children', () => {
      render(
        <Link
          href="/download"
          iconStart={<span data-testid="icon-start">⬇</span>}
        >
          Download
        </Link>
      );
      const link = screen.getByRole('link');
      const iconStart = link.querySelector('[data-testid="icon-start"]');
      expect(iconStart).toBeInTheDocument();
      expect(link.firstChild).toBe(iconStart);
    });

    it('renders iconEnd after children', () => {
      render(
        <Link href="/next" iconEnd={<span data-testid="icon-end">→</span>}>
          Next
        </Link>
      );
      const link = screen.getByRole('link');
      const iconEnd = link.querySelector('[data-testid="icon-end"]');
      expect(iconEnd).toBeInTheDocument();
      expect(link.lastChild).toBe(iconEnd);
    });

    it('renders both iconStart and iconEnd simultaneously', () => {
      render(
        <Link
          href="/page"
          iconStart={<span data-testid="icon-start">★</span>}
          iconEnd={<span data-testid="icon-end">→</span>}
        >
          Page
        </Link>
      );
      const link = screen.getByRole('link');
      const iconStart = link.querySelector('[data-testid="icon-start"]');
      const iconEnd = link.querySelector('[data-testid="icon-end"]');
      expect(iconStart).toBeInTheDocument();
      expect(iconEnd).toBeInTheDocument();
      expect(link.firstChild).toBe(iconStart);
      expect(link.lastChild).toBe(iconEnd);
    });

    it('renders without icon props', () => {
      render(<Link href="/about">About</Link>);
      const link = screen.getByRole('link', { name: 'About' });
      expect(link.childNodes).toHaveLength(1);
    });
  });

  describe('size variants', () => {
    it('does not apply size class by default', () => {
      render(<Link href="/about">About</Link>);
      const link = screen.getByRole('link');
      expect(link.className).toBe('dsn-link');
    });

    it('applies size class when size is small', () => {
      render(
        <Link href="/about" size="small">
          About
        </Link>
      );
      expect(screen.getByRole('link')).toHaveClass(
        'dsn-link',
        'dsn-link--size-small'
      );
    });

    it('applies size class when size is default', () => {
      render(
        <Link href="/about" size="default">
          About
        </Link>
      );
      expect(screen.getByRole('link')).toHaveClass(
        'dsn-link',
        'dsn-link--size-default'
      );
    });

    it('applies size class when size is large', () => {
      render(
        <Link href="/about" size="large">
          About
        </Link>
      );
      expect(screen.getByRole('link')).toHaveClass(
        'dsn-link',
        'dsn-link--size-large'
      );
    });

    it('combines size class with custom className', () => {
      render(
        <Link href="/about" size="small" className="custom">
          About
        </Link>
      );
      expect(screen.getByRole('link')).toHaveClass(
        'dsn-link',
        'dsn-link--size-small',
        'custom'
      );
    });
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Link
        href="/about"
        onClick={(e) => {
          e.preventDefault();
          clicked = true;
        }}
      >
        About
      </Link>
    );
    await user.click(screen.getByRole('link'));
    expect(clicked).toBe(true);
  });

  describe('external link', () => {
    it('sets target="_blank" when external', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('sets rel="noopener noreferrer" when external', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    });

    it('adds visible "(opent nieuw tabblad)" hint when external', () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('External (opent nieuw tabblad)');
    });

    it('does not add hint text when not external', () => {
      render(<Link href="/about">About</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('About');
      expect(link.textContent).not.toContain('opent nieuw tabblad');
    });

    it('allows overriding target when external', () => {
      render(
        <Link href="https://example.com" external target="_self">
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('target', '_self');
    });

    it('allows overriding rel when external', () => {
      render(
        <Link href="https://example.com" external rel="noopener">
          External
        </Link>
      );
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener');
    });

    it('keeps iconEnd when external', () => {
      render(
        <Link
          href="https://example.com"
          external
          iconEnd={<span data-testid="custom-icon">→</span>}
        >
          External
        </Link>
      );
      const link = screen.getByRole('link');
      expect(
        link.querySelector('[data-testid="custom-icon"]')
      ).toBeInTheDocument();
      expect(link).toHaveTextContent('External (opent nieuw tabblad)');
    });
  });
});
