import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('renders children', () => {
    render(<LinkButton>Klik hier</LinkButton>);
    expect(
      screen.getByRole('button', { name: 'Klik hier' })
    ).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<LinkButton>Klik hier</LinkButton>);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });

  it('applies base dsn-link and dsn-link-button classes', () => {
    render(<LinkButton>Klik hier</LinkButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('dsn-link', 'dsn-link-button');
  });

  it('has type="button" by default', () => {
    render(<LinkButton>Klik hier</LinkButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies custom className', () => {
    render(<LinkButton className="custom">Klik hier</LinkButton>);
    expect(screen.getByRole('button')).toHaveClass(
      'dsn-link',
      'dsn-link-button',
      'custom'
    );
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<LinkButton ref={ref}>Klik hier</LinkButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<LinkButton onClick={onClick}>Klik hier</LinkButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('type prop', () => {
    it('sets type="submit" when provided', () => {
      render(<LinkButton type="submit">Versturen</LinkButton>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('sets type="reset" when provided', () => {
      render(<LinkButton type="reset">Reset</LinkButton>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('disabled state', () => {
    it('applies the disabled attribute when disabled', () => {
      render(<LinkButton disabled>Klik hier</LinkButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not fire onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <LinkButton disabled onClick={onClick}>
          Klik hier
        </LinkButton>
      );
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('icon support', () => {
    it('renders iconStart before children', () => {
      render(
        <LinkButton iconStart={<span data-testid="icon-start">←</span>}>
          Terug
        </LinkButton>
      );
      const button = screen.getByRole('button');
      const iconStart = button.querySelector('[data-testid="icon-start"]');
      expect(iconStart).toBeInTheDocument();
      expect(button.firstChild).toBe(iconStart);
    });

    it('renders iconEnd after children', () => {
      render(
        <LinkButton iconEnd={<span data-testid="icon-end">→</span>}>
          Verder
        </LinkButton>
      );
      const button = screen.getByRole('button');
      const iconEnd = button.querySelector('[data-testid="icon-end"]');
      expect(iconEnd).toBeInTheDocument();
      expect(button.lastChild).toBe(iconEnd);
    });

    it('renders both iconStart and iconEnd simultaneously', () => {
      render(
        <LinkButton
          iconStart={<span data-testid="icon-start">←</span>}
          iconEnd={<span data-testid="icon-end">→</span>}
        >
          Label
        </LinkButton>
      );
      const button = screen.getByRole('button');
      expect(
        button.querySelector('[data-testid="icon-start"]')
      ).toBeInTheDocument();
      expect(
        button.querySelector('[data-testid="icon-end"]')
      ).toBeInTheDocument();
      expect(button.firstChild).toBe(
        button.querySelector('[data-testid="icon-start"]')
      );
      expect(button.lastChild).toBe(
        button.querySelector('[data-testid="icon-end"]')
      );
    });
  });

  describe('size variants', () => {
    it('does not apply a size class by default', () => {
      render(<LinkButton>Klik hier</LinkButton>);
      const button = screen.getByRole('button');
      expect(button.className).toBe('dsn-link dsn-link-button');
    });

    it.each(['small', 'default', 'large'] as const)(
      'applies size class for size="%s"',
      (size) => {
        render(<LinkButton size={size}>Klik hier</LinkButton>);
        expect(screen.getByRole('button')).toHaveClass(
          `dsn-link--size-${size}`
        );
      }
    );

    it('combines size class with custom className', () => {
      render(
        <LinkButton size="small" className="custom">
          Klik hier
        </LinkButton>
      );
      expect(screen.getByRole('button')).toHaveClass(
        'dsn-link',
        'dsn-link-button',
        'dsn-link--size-small',
        'custom'
      );
    });
  });

  it('passes additional HTML attributes', () => {
    render(
      <LinkButton data-testid="my-button" aria-label="Actie">
        Klik hier
      </LinkButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'my-button');
    expect(button).toHaveAttribute('aria-label', 'Actie');
  });
});
