import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { File, FileList } from './File';

describe('File', () => {
  describe('structuur', () => {
    it('rendert als een <div> element', () => {
      const { container } = render(<File fileName="document.pdf" />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('heeft altijd de basis dsn-file klasse', () => {
      const { container } = render(<File fileName="document.pdf" />);
      expect(container.firstChild).toHaveClass('dsn-file');
    });

    it('toont de bestandsnaam zonder extensie', () => {
      const { getByText } = render(<File fileName="document.pdf" />);
      expect(getByText('document')).toBeInTheDocument();
    });

    it('toont de bestandsnaam volledig als er geen extensie is', () => {
      const { getByText } = render(<File fileName="document" />);
      expect(getByText('document')).toBeInTheDocument();
    });

    it('toont fileType en fileSize als meta-tekst', () => {
      const { getByText } = render(
        <File fileName="document.pdf" fileType="PDF" fileSize="1,2 MB" />
      );
      expect(getByText('PDF · 1,2 MB')).toBeInTheDocument();
    });

    it('toont alleen fileType als fileSize ontbreekt', () => {
      const { getByText } = render(
        <File fileName="document.pdf" fileType="PDF" />
      );
      expect(getByText('PDF')).toBeInTheDocument();
    });

    it('toont alleen fileSize als fileType ontbreekt', () => {
      const { getByText } = render(
        <File fileName="document.pdf" fileSize="1,2 MB" />
      );
      expect(getByText('1,2 MB')).toBeInTheDocument();
    });

    it('toont geen meta-element als fileType en fileSize ontbreken', () => {
      const { container } = render(<File fileName="document.pdf" />);
      expect(
        container.querySelector('.dsn-file__meta')
      ).not.toBeInTheDocument();
    });

    it('bevat een aria-live regio', () => {
      const { container } = render(<File fileName="document.pdf" />);
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('accepteert extra className', () => {
      const { container } = render(
        <File fileName="document.pdf" className="extra-klasse" />
      );
      expect(container.firstChild).toHaveClass('extra-klasse');
    });

    it('accepteert extra HTML-attributen', () => {
      const { container } = render(
        <File fileName="document.pdf" data-testid="bestand" />
      );
      expect(container.firstChild).toHaveAttribute('data-testid', 'bestand');
    });

    it('heeft media-vlak met aria-hidden', () => {
      const { container } = render(<File fileName="document.pdf" />);
      const media = container.querySelector('.dsn-file__media');
      expect(media).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('naam als link', () => {
    it('rendert naam als <span> zonder href', () => {
      const { container } = render(<File fileName="document.pdf" />);
      const name = container.querySelector('.dsn-file__name');
      expect(name?.nodeName).toBe('SPAN');
    });

    it('rendert naam als <a> met href', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          onDelete={() => {}}
        />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name?.nodeName).toBe('A');
      expect(name).toHaveAttribute('href', '/bestanden/document.pdf');
    });

    it('naam-link heeft altijd target="_blank" en rel="noopener noreferrer"', () => {
      const { container } = render(
        <File fileName="document.pdf" href="/bestanden/document.pdf" />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name).toHaveAttribute('target', '_blank');
      expect(name).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('naam-link heeft target="_blank" ook wanneer onDelete aanwezig is', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          onDelete={() => {}}
        />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name).toHaveAttribute('target', '_blank');
    });

    it('naam-link heeft geen download-attribuut', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name).not.toHaveAttribute('download');
    });
  });

  describe('status: default', () => {
    it('heeft geen state-modifier klassen', () => {
      const { container } = render(<File fileName="document.pdf" />);
      expect(container.firstChild).not.toHaveClass('dsn-file--loading');
      expect(container.firstChild).not.toHaveClass('dsn-file--uploaded');
      expect(container.firstChild).not.toHaveClass('dsn-file--error');
    });
  });

  describe('status: loading', () => {
    it('heeft dsn-file--loading klasse', () => {
      const { container } = render(
        <File fileName="document.pdf" status="loading" />
      );
      expect(container.firstChild).toHaveClass('dsn-file--loading');
    });

    it('toont een Spinner in actions', () => {
      const { container } = render(
        <File fileName="document.pdf" status="loading" />
      );
      const spinner = container.querySelector('.dsn-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('Spinner heeft role="status"', () => {
      const { container } = render(
        <File fileName="document.pdf" status="loading" />
      );
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('gebruikt het loadingLabel voor de Spinner', () => {
      const { getByText } = render(
        <File
          fileName="document.pdf"
          status="loading"
          loadingLabel="Bezig met verwerken"
        />
      );
      expect(getByText('Bezig met verwerken')).toBeInTheDocument();
    });
  });

  describe('status: uploaded', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('heeft dsn-file--uploaded klasse', () => {
      const { container } = render(
        <File fileName="document.pdf" status="uploaded" onDelete={() => {}} />
      );
      expect(container.firstChild).toHaveClass('dsn-file--uploaded');
    });

    it('vult de aria-live regio met de uploadedLabel', () => {
      const { container } = render(
        <File fileName="document.pdf" status="uploaded" onDelete={() => {}} />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('document.pdf succesvol geüpload');
    });

    it('gebruikt een aangepaste uploadedLabel', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          status="uploaded"
          onDelete={() => {}}
          uploadedLabel="Bestand geüpload!"
        />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('Bestand geüpload!');
    });

    it('keert na 2 seconden terug naar default', () => {
      const { container } = render(
        <File fileName="document.pdf" status="uploaded" onDelete={() => {}} />
      );
      expect(container.firstChild).toHaveClass('dsn-file--uploaded');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(container.firstChild).not.toHaveClass('dsn-file--uploaded');
    });

    it('maakt de aria-live regio leeg na terugkeer naar default', () => {
      const { container } = render(
        <File fileName="document.pdf" status="uploaded" onDelete={() => {}} />
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('');
    });

    it('toont check-icoon niet in de interactieve variant', () => {
      const { container } = render(
        <File fileName="document.pdf" href="/doc.pdf" status="uploaded" />
      );
      expect(
        container.querySelector('.dsn-file__status-icon')
      ).not.toBeInTheDocument();
    });
  });

  describe('status: error', () => {
    it('heeft dsn-file--error klasse', () => {
      const { container } = render(
        <File fileName="document.pdf" status="error" />
      );
      expect(container.firstChild).toHaveClass('dsn-file--error');
    });

    it('toont de errorMessage', () => {
      const { getByText } = render(
        <File
          fileName="document.pdf"
          status="error"
          errorMessage="Upload mislukt. Probeer het opnieuw."
        />
      );
      expect(
        getByText('Upload mislukt. Probeer het opnieuw.')
      ).toBeInTheDocument();
    });

    it('toont geen errorMessage bij andere statussen', () => {
      const { queryByText } = render(
        <File
          fileName="document.pdf"
          status="default"
          errorMessage="Upload mislukt."
        />
      );
      expect(queryByText('Upload mislukt.')).not.toBeInTheDocument();
    });

    it('vult de aria-live regio met bestandsnaam en errorMessage', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          status="error"
          errorMessage="Upload mislukt. Probeer het opnieuw."
        />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent(
        'document.pdf: Upload mislukt. Probeer het opnieuw.'
      );
    });

    it('valt terug op een generieke tekst zonder errorMessage', () => {
      const { container } = render(
        <File fileName="document.pdf" status="error" />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('document.pdf uploaden mislukt');
    });

    it('gebruikt een aangepaste errorLabel', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          status="error"
          errorMessage="Upload mislukt. Probeer het opnieuw."
          errorLabel="Uploaden van document.pdf is mislukt"
        />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent(
        'Uploaden van document.pdf is mislukt'
      );
    });

    it('maakt de aria-live regio leeg wanneer de status weer default wordt', () => {
      const { container, rerender } = render(
        <File
          fileName="document.pdf"
          status="error"
          errorMessage="Upload mislukt."
        />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('document.pdf: Upload mislukt.');

      rerender(<File fileName="document.pdf" status="default" />);
      expect(liveRegion).toHaveTextContent('');
    });

    it('kondigt niets aan bij de loading state', () => {
      const { container } = render(
        <File fileName="document.pdf" status="loading" />
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('');
    });
  });

  describe('verwijder-knop', () => {
    it('toont de verwijder-knop wanneer onDelete aanwezig is', () => {
      const { container } = render(
        <File fileName="document.pdf" onDelete={() => {}} />
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('verwijder-knop heeft LinkButton stijl', () => {
      const { container } = render(
        <File fileName="document.pdf" onDelete={() => {}} />
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass(
        'dsn-link',
        'dsn-link-button',
        'dsn-link--size-default'
      );
    });

    it('toont geen verwijder-knop wanneer onDelete ontbreekt', () => {
      const { container } = render(<File fileName="document.pdf" />);
      expect(container.querySelector('button')).not.toBeInTheDocument();
    });

    it('bevat de volledige bestandsnaam visueel verborgen in de knoptekst', () => {
      const { container } = render(
        <File fileName="document.pdf" onDelete={() => {}} />
      );
      const hiddenSpan = container.querySelector('.dsn-visually-hidden');
      expect(hiddenSpan).toHaveTextContent('document.pdf');
    });

    it('gebruikt het deleteLabel op de knop', () => {
      const { getByText } = render(
        <File fileName="document.pdf" onDelete={() => {}} deleteLabel="Wis" />
      );
      expect(getByText(/Wis/)).toBeInTheDocument();
    });

    it('roept onDelete aan bij klik', () => {
      const handleDelete = vi.fn();
      const { container } = render(
        <File fileName="document.pdf" onDelete={handleDelete} />
      );
      container.querySelector('button')?.click();
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('interactieve variant', () => {
    it('heeft dsn-file--interactive klasse bij href zonder onDelete (view)', () => {
      const { container } = render(
        <File fileName="document.pdf" href="/bestanden/document.pdf" />
      );
      expect(container.firstChild).toHaveClass('dsn-file--interactive');
    });

    it('heeft geen dsn-file--interactive klasse bij href met onDelete', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          onDelete={() => {}}
        />
      );
      expect(container.firstChild).not.toHaveClass('dsn-file--interactive');
    });

    it('heeft geen dsn-file--interactive klasse bij ctaVariant="download"', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      expect(container.firstChild).not.toHaveClass('dsn-file--interactive');
    });

    it('naam heeft dsn-file__name--stretched klasse bij view', () => {
      const { container } = render(
        <File fileName="document.pdf" href="/bestanden/document.pdf" />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name).toHaveClass('dsn-file__name--stretched');
    });

    it('naam heeft geen dsn-file__name--stretched klasse bij download', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      const name = container.querySelector('.dsn-file__name');
      expect(name).not.toHaveClass('dsn-file__name--stretched');
    });

    it('ctaVariant="view": toont geen CTA-link in actions', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="view"
        />
      );
      const ctaLink = container.querySelector('.dsn-file__actions a');
      expect(ctaLink).not.toBeInTheDocument();
    });

    it('ctaVariant="download": CTA-link heeft download attribuut', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      const ctaLink = container.querySelector('.dsn-file__actions a');
      expect(ctaLink).toHaveAttribute('download');
    });

    it('ctaVariant="download": CTA-link heeft aria-hidden en tabindex="-1"', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      const ctaLink = container.querySelector('.dsn-file__actions a');
      expect(ctaLink).toHaveAttribute('aria-hidden', 'true');
      expect(ctaLink).toHaveAttribute('tabindex', '-1');
    });

    it('toont "Download" als standaard ctaLabel bij download', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
        />
      );
      const ctaLink = container.querySelector('.dsn-file__actions a');
      expect(ctaLink).toHaveTextContent('Download');
    });

    it('gebruikt een aangepaste ctaLabel bij download', () => {
      const { container } = render(
        <File
          fileName="document.pdf"
          href="/bestanden/document.pdf"
          ctaVariant="download"
          ctaLabel="Sla op"
        />
      );
      const ctaLink = container.querySelector('.dsn-file__actions a');
      expect(ctaLink).toHaveTextContent('Sla op');
    });
  });

  describe('afbeeldingspreview', () => {
    it('toont een <img> wanneer previewSrc aanwezig is', () => {
      const { container } = render(
        <File fileName="foto.jpg" previewSrc="/thumbs/foto.jpg" />
      );
      const img = container.querySelector('.dsn-file__preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/thumbs/foto.jpg');
      expect(img).toHaveAttribute('alt', '');
    });

    it('toont geen icon wanneer previewSrc aanwezig is', () => {
      const { container } = render(
        <File fileName="foto.jpg" previewSrc="/thumbs/foto.jpg" />
      );
      expect(container.querySelector('.dsn-icon')).not.toBeInTheDocument();
    });
  });

  describe('forwardRef', () => {
    it('stuurt ref door naar het root div-element', () => {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(<File ref={ref} fileName="document.pdf" />);
      expect(ref.current).toBe(container.firstChild);
    });
  });
});

describe('FileList', () => {
  it('rendert als een <ul> element', () => {
    const { container } = render(
      <FileList>
        <File fileName="document.pdf" />
      </FileList>
    );
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('heeft de dsn-file-list klasse', () => {
    const { container } = render(
      <FileList>
        <File fileName="document.pdf" />
      </FileList>
    );
    expect(container.firstChild).toHaveClass('dsn-file-list');
  });

  it('heeft role="list"', () => {
    const { container } = render(
      <FileList>
        <File fileName="document.pdf" />
      </FileList>
    );
    expect(container.firstChild).toHaveAttribute('role', 'list');
  });

  it('wraps elk child in een <li>', () => {
    const { container } = render(
      <FileList>
        <File fileName="document.pdf" />
        <File fileName="foto.jpg" />
      </FileList>
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  it('accepteert extra className', () => {
    const { container } = render(
      <FileList className="extra">
        <File fileName="document.pdf" />
      </FileList>
    );
    expect(container.firstChild).toHaveClass('extra');
  });

  it('stuurt ref door naar het root ul-element', () => {
    const ref = React.createRef<HTMLUListElement>();
    const { container } = render(
      <FileList ref={ref}>
        <File fileName="document.pdf" />
      </FileList>
    );
    expect(ref.current).toBe(container.firstChild);
  });
});
