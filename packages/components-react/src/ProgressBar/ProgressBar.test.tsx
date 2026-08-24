import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders as a <div> element', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('always has base dsn-progress-bar class', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    expect(container.firstChild).toHaveClass('dsn-progress-bar');
  });

  it('renders a visually hidden label', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('dsn-visually-hidden');
    expect(label).toHaveTextContent('Uploaden');
  });

  it('renders a <progress> element', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    const progress = container.querySelector('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('dsn-progress-bar__bar');
  });

  it('links label to progress via id', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={35} id="pb-test" />
    );
    const label = container.querySelector('label');
    const progress = container.querySelector('progress');
    expect(label).toHaveAttribute('for', 'pb-test');
    expect(progress).toHaveAttribute('id', 'pb-test');
  });

  it('generates an id automatically when no id prop is given', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    const label = container.querySelector('label');
    const progress = container.querySelector('progress');
    const labelFor = label?.getAttribute('for');
    expect(labelFor).toBeTruthy();
    expect(progress).toHaveAttribute('id', labelFor);
  });

  it('sets value and max on the progress element', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={35} max={100} />
    );
    const progress = container.querySelector('progress');
    expect(progress).toHaveAttribute('value', '35');
    expect(progress).toHaveAttribute('max', '100');
  });

  it('defaults max to 100', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={50} />);
    const progress = container.querySelector('progress');
    expect(progress).toHaveAttribute('max', '100');
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    const percentage = container.querySelector('.dsn-progress-bar__percentage');
    expect(percentage).toHaveTextContent('35%');
  });

  it('rounds percentage for custom max', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={3} max={7} />
    );
    const percentage = container.querySelector('.dsn-progress-bar__percentage');
    expect(percentage).toHaveTextContent('43%');
  });

  it('percentage has aria-hidden="true"', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    const percentage = container.querySelector('.dsn-progress-bar__percentage');
    expect(percentage).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render description when not provided', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    expect(
      container.querySelector('.dsn-progress-bar__description')
    ).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const { container } = render(
      <ProgressBar
        label="Uploaden"
        value={35}
        description="Bestand wordt geüpload..."
      />
    );
    const description = container.querySelector(
      '.dsn-progress-bar__description'
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Bestand wordt geüpload...');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={35} className="custom" />
    );
    expect(container.firstChild).toHaveClass('dsn-progress-bar');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<ProgressBar label="Uploaden" value={35} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={35} data-testid="pb" />
    );
    expect(container.firstChild).toHaveAttribute('data-testid', 'pb');
  });

  it('renders header div', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    expect(
      container.querySelector('.dsn-progress-bar__header')
    ).toBeInTheDocument();
  });

  it('shows 0% at start', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={0} />);
    const percentage = container.querySelector('.dsn-progress-bar__percentage');
    expect(percentage).toHaveTextContent('0%');
  });

  it('shows 100% at end', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={100} />);
    const percentage = container.querySelector('.dsn-progress-bar__percentage');
    expect(percentage).toHaveTextContent('100%');
  });

  it('hides percentage when hideValue is true', () => {
    const { container } = render(
      <ProgressBar label="Uploaden" value={35} hideValue />
    );
    expect(
      container.querySelector('.dsn-progress-bar__percentage')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('.dsn-progress-bar__header')
    ).not.toBeInTheDocument();
  });

  it('shows percentage by default when hideValue is not set', () => {
    const { container } = render(<ProgressBar label="Uploaden" value={35} />);
    expect(
      container.querySelector('.dsn-progress-bar__percentage')
    ).toBeInTheDocument();
  });

  it('links the description to the progress element via aria-describedby', () => {
    const { container } = render(
      <ProgressBar
        label="Upload"
        value={35}
        id="upload"
        description="Bestand wordt geupload, even geduld..."
      />
    );
    const progress = container.querySelector('progress');
    expect(progress).toHaveAttribute('aria-describedby', 'upload-description');
    expect(
      screen.getByText('Bestand wordt geupload, even geduld...')
    ).toHaveAttribute('id', 'upload-description');
  });

  it('sets no aria-describedby when there is no description', () => {
    const { container } = render(<ProgressBar label="Upload" value={35} />);
    expect(container.querySelector('progress')).not.toHaveAttribute(
      'aria-describedby'
    );
  });
});
