import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconList, IconListItem } from './IconList';

// =============================================================================
// IconList
// =============================================================================

describe('IconList', () => {
  it('renders as a <ul> element by default', () => {
    const { container } = render(<IconList />);
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('renders as an <ol> element when as is "ol"', () => {
    const { container } = render(<IconList as="ol" />);
    expect(container.firstChild?.nodeName).toBe('OL');
  });

  it('always has base dsn-icon-list class', () => {
    const { container } = render(<IconList />);
    expect(container.firstChild).toHaveClass('dsn-icon-list');
  });

  it('sets role="list" so Safari/VoiceOver keeps announcing the list', () => {
    render(<IconList />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('sets role="list" on the ordered variant as well', () => {
    render(<IconList as="ol" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('does not set an inline icon color by default', () => {
    const { container } = render(<IconList />);
    expect(container.firstElementChild?.getAttribute('style')).toBeNull();
  });

  it('sets --dsn-icon-list-icon-color when iconColor is given', () => {
    const { container } = render(
      <IconList iconColor="var(--dsn-color-positive-color-default)" />
    );
    expect(container.firstElementChild?.getAttribute('style')).toContain(
      '--dsn-icon-list-icon-color: var(--dsn-color-positive-color-default)'
    );
  });

  it('keeps other inline styles when iconColor is given', () => {
    const { container } = render(
      <IconList
        iconColor="var(--dsn-color-negative-color-default)"
        style={{ marginBlockEnd: '0px' }}
      />
    );
    const style = container.firstElementChild?.getAttribute('style');
    expect(style).toContain('margin-block-end: 0px');
    expect(style).toContain('--dsn-icon-list-icon-color');
  });

  it('applies custom className', () => {
    const { container } = render(<IconList className="custom" />);
    expect(container.firstChild).toHaveClass('dsn-icon-list');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders children', () => {
    render(
      <IconList>
        <IconListItem icon="clock">Duurt 30 minuten</IconListItem>
      </IconList>
    );
    expect(screen.getByText('Duurt 30 minuten')).toBeInTheDocument();
  });

  it('forwards ref to the list element', () => {
    const ref = { current: null as HTMLUListElement | null };
    render(<IconList ref={ref} />);
    expect(ref.current?.tagName).toBe('UL');
  });

  it('spreads additional HTML attributes', () => {
    render(<IconList data-testid="my-list" />);
    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });
});

// =============================================================================
// IconListItem
// =============================================================================

describe('IconListItem', () => {
  it('renders as a <li> element', () => {
    const { container } = render(
      <IconList>
        <IconListItem icon="check">Tekst</IconListItem>
      </IconList>
    );
    expect(container.querySelector('li')).toBeInTheDocument();
  });

  it('always has base dsn-icon-list__item class', () => {
    const { container } = render(
      <IconList>
        <IconListItem icon="check">Tekst</IconListItem>
      </IconList>
    );
    expect(container.querySelector('li')).toHaveClass('dsn-icon-list__item');
  });

  it('renders the icon with the dsn-icon-list__icon class', () => {
    const { container } = render(
      <IconList>
        <IconListItem icon="check">Tekst</IconListItem>
      </IconList>
    );
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('dsn-icon');
    expect(icon).toHaveClass('dsn-icon-list__icon');
  });

  it('marks the icon as decorative', () => {
    const { container } = render(
      <IconList>
        <IconListItem icon="check">Tekst</IconListItem>
      </IconList>
    );
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('exposes only the item text, the icon adds nothing to the content', () => {
    render(
      <IconList>
        <IconListItem icon="check">Aanvraag goedgekeurd</IconListItem>
      </IconList>
    );
    expect(screen.getByRole('listitem')).toHaveTextContent(
      /^Aanvraag goedgekeurd$/
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <IconList>
        <IconListItem icon="check" className="custom-item">
          Tekst
        </IconListItem>
      </IconList>
    );
    expect(container.querySelector('li')).toHaveClass('custom-item');
  });

  it('forwards ref to the li element', () => {
    const ref = { current: null as HTMLLIElement | null };
    render(
      <IconList>
        <IconListItem icon="check" ref={ref}>
          Tekst
        </IconListItem>
      </IconList>
    );
    expect(ref.current?.tagName).toBe('LI');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <IconList>
        <IconListItem icon="check" data-testid="my-item">
          Tekst
        </IconListItem>
      </IconList>
    );
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });
});
