import type { Meta, StoryObj } from '@storybook/react-vite';
import { File, FileList } from '@dsn-starter-kit/components-react';
import DocsPage from './File.docs.mdx';
import { rtlDecorator, VEEL_TEKST } from './story-helpers';

const HREF = '/bestanden/document.pdf';
const IMG_SRC = 'https://picsum.photos/seed/file1/200/200';

const meta: Meta<typeof File> = {
  title: 'Components/File',
  component: File,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const status = args.status ?? 'default';
        const hasHref = Boolean(args.href);
        const hasDelete = Boolean(args.onDelete);
        const isInteractive = hasHref && !hasDelete;
        const isLoading = status === 'loading';
        const isUploaded = status === 'uploaded';
        const isError = status === 'error';
        const ctaVariantVal = args.ctaVariant ?? 'view';
        const isStretchedLink = isInteractive && ctaVariantVal !== 'download';

        const modifiers = [
          isLoading ? 'dsn-file--loading' : '',
          isUploaded ? 'dsn-file--uploaded' : '',
          isError ? 'dsn-file--error' : '',
          isStretchedLink ? 'dsn-file--interactive' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const rootClass = `dsn-file${modifiers ? ' ' + modifiers : ''}`;

        const fileName = args.fileName ?? 'document.pdf';
        const lastDot = fileName.lastIndexOf('.');
        const nameWithoutExt =
          lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
        const fileType = args.fileType ?? 'PDF';
        const fileSize = args.fileSize ?? '1,2 MB';
        const metaParts = [fileType, fileSize].filter(Boolean);
        const meta = metaParts.join(' · ');

        const nameTag = hasHref ? 'a' : 'span';
        const nameClass = `dsn-file__name${hasHref ? ' dsn-link' : ''}${isStretchedLink ? ' dsn-file__name--stretched' : ''}`;
        const hrefAttr = hasHref ? ` href="${args.href}"` : '';
        const targetAttr = hasHref
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        const nameEl = `<${nameTag} class="${nameClass}"${hrefAttr}${targetAttr}>${nameWithoutExt}</${nameTag}>`;

        const errorEl =
          isError && args.errorMessage
            ? `\n    <p class="dsn-form-field-error-message">
      <svg class="dsn-icon" aria-hidden="true"><!-- exclamation-circle.svg --></svg>
      ${args.errorMessage}
    </p>`
            : '';

        const spinnerEl = isLoading
          ? `<div class="dsn-spinner" role="status">
      <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
        <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
      </svg>
      <span class="dsn-spinner__label dsn-visually-hidden">Bezig met uploaden</span>
    </div>`
          : '';

        const checkEl = isUploaded
          ? `<svg class="dsn-icon dsn-file__status-icon" aria-hidden="true"><!-- check.svg --></svg>`
          : '';

        const deleteEl =
          !isLoading && !isUploaded && hasDelete
            ? `<button type="button" class="dsn-link dsn-link-button dsn-link--size-default">
      <svg class="dsn-icon" aria-hidden="true"><!-- trash.svg --></svg>
      ${args.deleteLabel ?? 'Verwijder'}<span class="dsn-visually-hidden"> ${fileName}</span>
    </button>`
            : '';

        const ctaLabel = args.ctaLabel ?? 'Download';
        const ctaEl =
          isInteractive && ctaVariantVal === 'download'
            ? `<a class="dsn-link" href="${args.href}" aria-hidden="true" tabindex="-1" download>
      <svg class="dsn-icon" aria-hidden="true"><!-- download.svg --></svg>
      ${ctaLabel}
    </a>`
            : '';

        const actionsContent = spinnerEl || checkEl || deleteEl || ctaEl || '';

        // aria-live regio: alleen gevuld bij een eindstatus van de upload
        let liveText = '';
        if (isUploaded) {
          liveText = args.uploadedLabel ?? `${fileName} succesvol geüpload`;
        } else if (isError) {
          liveText =
            args.errorLabel ??
            (args.errorMessage
              ? `${fileName}: ${args.errorMessage}`
              : `${fileName} uploaden mislukt`);
        }

        const mediaEl = args.previewSrc
          ? `<img class="dsn-file__preview" src="${args.previewSrc}" alt="" />`
          : `<svg class="dsn-icon" aria-hidden="true"><!-- ${args.mediaType === 'image' ? 'photo' : 'file-description'}.svg --></svg>`;

        return `<div class="${rootClass}">
  <div class="dsn-file__media" aria-hidden="true">
    ${mediaEl}
  </div>
  <div class="dsn-file__content">
    ${nameEl}
    <span class="dsn-file__meta">${meta}</span>${errorEl}
  </div>
  <div class="dsn-file__actions">
    ${actionsContent}
  </div>
  <span class="dsn-visually-hidden" aria-live="polite" aria-atomic="true">${liveText}</span>
</div>`;
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'loading', 'uploaded', 'error'],
    },
    ctaVariant: {
      control: 'select',
      options: ['view', 'download'],
    },
    mediaType: {
      control: 'select',
      options: ['document', 'image'],
    },
    onDelete: { control: false },
  },
  args: {
    fileName: 'document.pdf',
    fileType: 'PDF',
    fileSize: '1,2 MB',
    status: 'default',
    ctaVariant: 'view',
    mediaType: 'document',
  },
};

export default meta;
type Story = StoryObj<typeof File>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  args: {
    href: HREF,
    onDelete: () => {},
  },
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Loading: Story = {
  args: {
    status: 'loading',
  },
};

export const Uploaded: Story = {
  args: {
    href: HREF,
    status: 'uploaded',
    onDelete: () => {},
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    errorMessage: 'Upload mislukt. Probeer het opnieuw.',
    onDelete: () => {},
  },
};

export const WithImagePreview: Story = {
  args: {
    fileName: 'foto.jpg',
    fileType: 'JPG',
    fileSize: '3,4 MB',
    href: HREF,
    previewSrc: IMG_SRC,
    onDelete: () => {},
  },
};

export const InteractiveView: Story = {
  name: 'Interactive',
  args: {
    href: HREF,
    ctaVariant: 'view',
  },
};

export const InteractiveDownload: Story = {
  args: {
    href: HREF,
    ctaVariant: 'download',
  },
};

export const DocumentType: Story = {
  name: 'Document Icon',
  args: {
    href: HREF,
    onDelete: () => {},
    mediaType: 'document',
  },
};

export const ImageType: Story = {
  name: 'Image Icon',
  args: {
    fileName: 'foto.jpg',
    fileType: 'JPG',
    fileSize: '3,4 MB',
    href: HREF,
    onDelete: () => {},
    mediaType: 'image',
  },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All Upload States',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '560px',
      }}
    >
      <File
        fileName="document.pdf"
        fileType="PDF"
        fileSize="1,2 MB"
        href={HREF}
        onDelete={() => {}}
      />
      <File
        fileName="document.pdf"
        fileType="PDF"
        fileSize="1,2 MB"
        status="loading"
      />
      <File
        fileName="document.pdf"
        fileType="PDF"
        fileSize="1,2 MB"
        href={HREF}
        status="uploaded"
        onDelete={() => {}}
      />
      <File
        fileName="document.pdf"
        fileType="PDF"
        fileSize="1,2 MB"
        status="error"
        errorMessage="Upload mislukt. Probeer het opnieuw."
        onDelete={() => {}}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortFileName: Story = {
  args: {
    fileName: 'a.pdf',
    fileType: 'PDF',
    fileSize: '1 kB',
    href: HREF,
    onDelete: () => {},
  },
};

export const LongFileName: Story = {
  args: {
    fileName: `${VEEL_TEKST}.pdf`,
    fileType: 'PDF',
    fileSize: '12,3 MB',
    href: HREF,
    onDelete: () => {},
  },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <File
        fileName="مستند.pdf"
        fileType="PDF"
        fileSize="١٫٢ ميغابايت"
        href={HREF}
        onDelete={() => {}}
        deleteLabel="حذف"
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// =============================================================================
// FILELIST
// =============================================================================

export const WithFileList: Story = {
  name: 'File List',
  render: () => (
    <FileList style={{ maxWidth: '560px' }}>
      <File
        fileName="document.pdf"
        fileType="PDF"
        fileSize="1,2 MB"
        href={HREF}
        onDelete={() => {}}
      />
      <File
        fileName="foto.jpg"
        fileType="JPG"
        fileSize="3,4 MB"
        href={HREF}
        previewSrc={IMG_SRC}
        onDelete={() => {}}
      />
      <File
        fileName="rapport-2024.xlsx"
        fileType="XLSX"
        fileSize="450 kB"
        status="error"
        errorMessage="Bestandstype niet toegestaan."
        onDelete={() => {}}
      />
    </FileList>
  ),
  parameters: { controls: { disable: true } },
};
