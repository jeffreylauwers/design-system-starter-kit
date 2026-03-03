import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ButtonLink } from './ButtonLink';

describe('ButtonLink', () => {
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it('renders as an anchor element', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders children wrapped in dsn-button__label', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    const label = screen.getByText('Label');
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveClass('dsn-button__label');
  });

  it('does not render dsn-button__label when children is undefined', () => {
    const { container } = render(<ButtonLink href="/test" />);
    expect(container.querySelector('.dsn-button__label')).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Base classes
  // ---------------------------------------------------------------------------

  it('applies base classes by default', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('dsn-button');
    expect(link).toHaveClass('dsn-button--strong');
    expect(link).toHaveClass('dsn-button--size-default');
    expect(link).toHaveClass('dsn-button-link');
  });

  it('applies custom className alongside base classes', () => {
    render(
      <ButtonLink href="/test" className="custom-class">
        Label
      </ButtonLink>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('dsn-button');
    expect(link).toHaveClass('custom-class');
  });

  // ---------------------------------------------------------------------------
  // href
  // ---------------------------------------------------------------------------

  it('sets href when not disabled', () => {
    render(<ButtonLink href="/go">Label</ButtonLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/go');
  });

  // ---------------------------------------------------------------------------
  // Variant
  // ---------------------------------------------------------------------------

  it.each([
    'strong',
    'strong-negative',
    'strong-positive',
    'default',
    'default-negative',
    'default-positive',
    'subtle',
    'subtle-negative',
    'subtle-positive',
  ] as const)('applies variant class for "%s"', (variant) => {
    render(
      <ButtonLink href="/test" variant={variant}>
        Label
      </ButtonLink>
    );
    expect(screen.getByRole('link')).toHaveClass(`dsn-button--${variant}`);
  });

  // ---------------------------------------------------------------------------
  // Size
  // ---------------------------------------------------------------------------

  it.each(['small', 'default', 'large'] as const)(
    'applies size class for "%s"',
    (size) => {
      render(
        <ButtonLink href="/test" size={size}>
          Label
        </ButtonLink>
      );
      expect(screen.getByRole('link')).toHaveClass(`dsn-button--size-${size}`);
    }
  );

  // ---------------------------------------------------------------------------
  // fullWidth
  // ---------------------------------------------------------------------------

  it('applies dsn-button--full-width when fullWidth is true', () => {
    render(
      <ButtonLink href="/test" fullWidth>
        Label
      </ButtonLink>
    );
    expect(screen.getByRole('link')).toHaveClass('dsn-button--full-width');
  });

  it('does not apply dsn-button--full-width by default', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    expect(screen.getByRole('link')).not.toHaveClass('dsn-button--full-width');
  });

  // ---------------------------------------------------------------------------
  // iconOnly
  // ---------------------------------------------------------------------------

  it('applies dsn-button--icon-only when iconOnly is true', () => {
    render(
      <ButtonLink href="/test" iconOnly>
        Label
      </ButtonLink>
    );
    expect(screen.getByRole('link')).toHaveClass('dsn-button--icon-only');
  });

  it('does not apply dsn-button--icon-only by default', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    expect(screen.getByRole('link')).not.toHaveClass('dsn-button--icon-only');
  });

  // ---------------------------------------------------------------------------
  // Icons
  // ---------------------------------------------------------------------------

  it('renders iconStart before the label', () => {
    const { container } = render(
      <ButtonLink href="/test" iconStart={<svg data-testid="icon-start" />}>
        Label
      </ButtonLink>
    );
    const children = Array.from(container.querySelector('a')!.childNodes);
    const iconIndex = children.findIndex(
      (n) => (n as Element).getAttribute?.('data-testid') === 'icon-start'
    );
    const labelIndex = children.findIndex((n) =>
      (n as Element).classList?.contains('dsn-button__label')
    );
    expect(iconIndex).toBeLessThan(labelIndex);
  });

  it('renders iconEnd after the label', () => {
    const { container } = render(
      <ButtonLink href="/test" iconEnd={<svg data-testid="icon-end" />}>
        Label
      </ButtonLink>
    );
    const children = Array.from(container.querySelector('a')!.childNodes);
    const labelIndex = children.findIndex((n) =>
      (n as Element).classList?.contains('dsn-button__label')
    );
    const iconIndex = children.findIndex(
      (n) => (n as Element).getAttribute?.('data-testid') === 'icon-end'
    );
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  // ---------------------------------------------------------------------------
  // Disabled
  // ---------------------------------------------------------------------------

  it('sets aria-disabled and tabIndex=-1 when disabled', () => {
    const { container } = render(
      <ButtonLink href="/test" disabled>
        Label
      </ButtonLink>
    );
    // <a> without href has no ARIA role "link" — query the DOM directly
    const link = container.querySelector('a')!;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('removes href when disabled', () => {
    const { container } = render(
      <ButtonLink href="/test" disabled>
        Label
      </ButtonLink>
    );
    // <a> without href has no ARIA role "link" — query the DOM directly
    const link = container.querySelector('a')!;
    expect(link).not.toHaveAttribute('href');
  });

  it('prevents navigation when disabled and clicked', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ButtonLink href="/test" disabled onClick={onClick}>
        Label
      </ButtonLink>
    );
    // pointer-events: none prevents userEvent.click — use fireEvent to test
    // that the React onClick handler also guards against disabled clicks
    const link = container.querySelector('a')!;
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-disabled');
  });

  // ---------------------------------------------------------------------------
  // External
  // ---------------------------------------------------------------------------

  it('sets target="_blank" and rel="noopener noreferrer" when external', () => {
    render(
      <ButtonLink href="https://example.com" external>
        Label
      </ButtonLink>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders "(opent nieuw tabblad)" text when external', () => {
    render(
      <ButtonLink href="https://example.com" external>
        Label
      </ButtonLink>
    );
    expect(screen.getByText(/opent nieuw tabblad/)).toBeInTheDocument();
  });

  it('respects explicit target override when external', () => {
    render(
      <ButtonLink href="https://example.com" external target="_self">
        Label
      </ButtonLink>
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_self');
  });

  it('respects explicit rel override when external', () => {
    render(
      <ButtonLink href="https://example.com" external rel="noreferrer">
        Label
      </ButtonLink>
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noreferrer');
  });

  it('does not render "(opent nieuw tabblad)" when not external', () => {
    render(<ButtonLink href="/test">Label</ButtonLink>);
    expect(screen.queryByText(/opent nieuw tabblad/)).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // onClick
  // ---------------------------------------------------------------------------

  it('calls onClick when clicked and not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonLink href="/test" onClick={onClick}>
        Label
      </ButtonLink>
    );
    await user.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Ref forwarding
  // ---------------------------------------------------------------------------

  it('forwards ref to the anchor element', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <ButtonLink href="/test" ref={ref}>
        Label
      </ButtonLink>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  // ---------------------------------------------------------------------------
  // Additional HTML attributes
  // ---------------------------------------------------------------------------

  it('passes additional HTML attributes to the anchor', () => {
    render(
      <ButtonLink href="/test" data-testid="my-link" aria-label="Go">
        Label
      </ButtonLink>
    );
    const link = screen.getByTestId('my-link');
    expect(link).toHaveAttribute('aria-label', 'Go');
  });
});
