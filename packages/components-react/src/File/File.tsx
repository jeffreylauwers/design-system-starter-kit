import React from 'react';
import { classNames } from '@dsn-starter-kit/core';
import { Icon } from '../Icon';
import { Spinner } from '../Spinner';
import { FormFieldErrorMessage } from '../FormFieldErrorMessage';
import './File.css';

export type FileStatus = 'default' | 'loading' | 'uploaded' | 'error';
export type FileCtaVariant = 'view' | 'download';
export type FileMediaType = 'document' | 'image';

export interface FileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Bestandsnaam inclusief extensie (vereist). Extensie wordt visueel afgekapt. */
  fileName: string;

  /** Bestandstype als afkorting: "PDF", "JPG". Getoond in dsn-file__meta. */
  fileType?: string;

  /** Bestandsgrootte als geformatteerde string: "1,2 MB". */
  fileSize?: string;

  /**
   * State van het bestand.
   * Bij 'uploaded' keert het component na 2 seconden automatisch terug naar 'default'.
   * @default 'default'
   */
  status?: FileStatus;

  /** Foutmelding, getoond bij status="error". */
  errorMessage?: string;

  /** URL naar het bestand. Maakt de naam een <a> en schakelt de interactieve variant in. */
  href?: string;

  /** Callback voor de verwijderactie. Toont de "Verwijder"-knop. */
  onDelete?: () => void;

  /**
   * Zichtbare tekst op de verwijder-knop.
   * @default "Verwijder"
   */
  deleteLabel?: string;

  /**
   * CTA-type in de interactieve variant.
   * 'view' toont geen aparte CTA; de bestandsnaam opent als stretched link in een nieuw tabblad.
   * 'download' toont een aparte download-knop; de bestandsnaam opent in een nieuw tabblad.
   * @default 'view'
   */
  ctaVariant?: FileCtaVariant;

  /**
   * Overschrijft het standaard CTA-label voor de download-variant.
   * Standaard: "Download".
   */
  ctaLabel?: string;

  /**
   * Bepaalt het icoon: file-description.svg of photo.svg.
   * Genegeerd wanneer previewSrc aanwezig is.
   * @default 'document'
   */
  mediaType?: FileMediaType;

  /** URL van de afbeeldingspreview. Vervangt het icoon in het media-vlak. */
  previewSrc?: string;

  /**
   * Visueel verborgen label voor de Spinner.
   * @default "Bezig met uploaden"
   */
  loadingLabel?: string;

  /**
   * Tekst voor de aria-live regio bij de uploaded state.
   * @default "{fileName} succesvol geüpload"
   */
  uploadedLabel?: string;

  /**
   * Tekst voor de aria-live regio bij de error state.
   * Standaard "{fileName}: {errorMessage}", of "{fileName} uploaden mislukt"
   * wanneer er geen errorMessage is.
   */
  errorLabel?: string;
}

/**
 * File component
 * Toont meta-informatie over een bestand (naam, type, grootte) samen met acties.
 * Ondersteunt vier upload-states (default, loading, uploaded, error) en een
 * interactieve variant voor controle- of detailpagina's.
 *
 * @example
 * ```tsx
 * // Default — eerder geüpload bestand, met verwijder-optie
 * <File
 *   fileName="document.pdf"
 *   fileType="PDF"
 *   fileSize="1,2 MB"
 *   href="/bestanden/document.pdf"
 *   onDelete={() => handleDelete()}
 * />
 *
 * // Interactief — bestandsnaam als link (nieuw tabblad)
 * <File
 *   fileName="rapport-2024.pdf"
 *   fileType="PDF"
 *   fileSize="2,1 MB"
 *   href="/bestanden/rapport-2024.pdf"
 * />
 *
 * // Interactief — download CTA
 * <File
 *   fileName="rapport-2024.pdf"
 *   fileType="PDF"
 *   fileSize="2,1 MB"
 *   href="/bestanden/rapport-2024.pdf"
 *   ctaVariant="download"
 * />
 * ```
 */
export const File = React.forwardRef<HTMLDivElement, FileProps>(
  (
    {
      className,
      fileName,
      fileType,
      fileSize,
      status = 'default',
      errorMessage,
      href,
      onDelete,
      deleteLabel = 'Verwijder',
      ctaVariant = 'view',
      ctaLabel,
      mediaType = 'document',
      previewSrc,
      loadingLabel = 'Bezig met uploaden',
      uploadedLabel,
      errorLabel,
      ...props
    },
    ref
  ) => {
    const [currentStatus, setCurrentStatus] =
      React.useState<FileStatus>(status);
    const [liveText, setLiveText] = React.useState('');

    // Synchroniseer externe status-prop met interne state
    React.useEffect(() => {
      setCurrentStatus(status);
    }, [status]);

    // Vul de aria-live regio bij een eindstatus van de upload.
    // De tekst wordt pas ná de eerste render gezet, zodat screenreaders de
    // wijziging in de regio waarnemen en aankondigen.
    React.useEffect(() => {
      // Uploaded: kondig succes aan en keer na 2s terug naar default
      if (currentStatus === 'uploaded') {
        setLiveText(uploadedLabel ?? `${fileName} succesvol geüpload`);

        const timer = setTimeout(() => {
          setCurrentStatus('default');
          setLiveText('');
        }, 2000);

        return () => clearTimeout(timer);
      }

      // Error: kondig de mislukking aan, inclusief de reden wanneer bekend.
      // De tekst blijft staan zolang de error-state actief is.
      if (currentStatus === 'error') {
        setLiveText(
          errorLabel ??
            (errorMessage
              ? `${fileName}: ${errorMessage}`
              : `${fileName} uploaden mislukt`)
        );
        return undefined;
      }

      // Default en loading: geen aankondiging
      setLiveText('');
      return undefined;
    }, [currentStatus, fileName, uploadedLabel, errorLabel, errorMessage]);

    // Bestandsnaam zonder extensie voor visuele weergave
    const fileNameWithoutExt = React.useMemo(() => {
      const lastDot = fileName.lastIndexOf('.');
      return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
    }, [fileName]);

    // Meta-tekst: "PDF · 1,2 MB" of alleen type of grootte
    const metaParts = [fileType, fileSize].filter(Boolean);
    const metaText = metaParts.join(' · ');

    // Interactieve modus: href aanwezig en geen onDelete
    const isInteractive = Boolean(href) && !onDelete;
    // Stretched link: interactief zonder aparte download-CTA
    const isStretchedLink = isInteractive && ctaVariant !== 'download';

    const rootClasses = classNames(
      'dsn-file',
      currentStatus === 'loading' && 'dsn-file--loading',
      currentStatus === 'uploaded' && 'dsn-file--uploaded',
      currentStatus === 'error' && 'dsn-file--error',
      isStretchedLink && 'dsn-file--interactive',
      className
    );

    const nameClasses = classNames(
      'dsn-file__name',
      href && 'dsn-link',
      isStretchedLink && 'dsn-file__name--stretched'
    );

    const iconName = mediaType === 'image' ? 'photo' : 'file-description';
    const resolvedCtaLabel = ctaLabel ?? 'Download';

    return (
      <div ref={ref} className={rootClasses} {...props}>
        {/* Media-vlak: icoon of preview */}
        <div className="dsn-file__media" aria-hidden="true">
          {previewSrc ? (
            <img className="dsn-file__preview" src={previewSrc} alt="" />
          ) : (
            <Icon name={iconName} aria-hidden />
          )}
        </div>

        {/* Content: naam, meta en optionele ErrorMessage */}
        <div className="dsn-file__content">
          {href ? (
            <a
              className={nameClasses}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {fileNameWithoutExt}
            </a>
          ) : (
            <span className={nameClasses}>{fileNameWithoutExt}</span>
          )}
          {metaText && <span className="dsn-file__meta">{metaText}</span>}
          {currentStatus === 'error' && errorMessage && (
            <FormFieldErrorMessage>{errorMessage}</FormFieldErrorMessage>
          )}
        </div>

        {/* Actions: Spinner, status-icoon, verwijder-knop of CTA-link */}
        <div className="dsn-file__actions">
          {!isInteractive && currentStatus === 'loading' && (
            <Spinner label={loadingLabel} hideLabel />
          )}
          {!isInteractive && currentStatus === 'uploaded' && (
            <Icon className="dsn-file__status-icon" name="check" aria-hidden />
          )}
          {!isInteractive &&
            (currentStatus === 'default' || currentStatus === 'error') &&
            onDelete && (
              <button
                type="button"
                className="dsn-link dsn-link-button dsn-link--size-default"
                onClick={onDelete}
              >
                <Icon name="trash" aria-hidden />
                {deleteLabel}
                <span className="dsn-visually-hidden"> {fileName}</span>
              </button>
            )}
          {isInteractive && ctaVariant === 'download' && (
            <a
              className="dsn-link"
              href={href}
              aria-hidden="true"
              tabIndex={-1}
              download
            >
              <Icon name="download" aria-hidden />
              {resolvedCtaLabel}
            </a>
          )}
        </div>

        {/* aria-live regio: kondigt statuswijzigingen aan voor screenreaders */}
        <span
          className="dsn-visually-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveText}
        </span>
      </div>
    );
  }
);

File.displayName = 'File';

// =============================================================================
// FileList — ul wrapper voor meerdere File items
// =============================================================================

export interface FileListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** File componenten */
  children?: React.ReactNode;
  className?: string;
}

/**
 * FileList component
 * Wrapper voor meerdere File componenten.
 * Rendert een <ul role="list"> met <li> wrappers — nodig omdat CSS-resets lijstsemantiek verwijderen.
 *
 * @example
 * ```tsx
 * <FileList>
 *   <File fileName="document.pdf" fileType="PDF" fileSize="1,2 MB" href="..." onDelete={() => {}} />
 *   <File fileName="foto.jpg" fileType="JPG" fileSize="3,4 MB" href="..." onDelete={() => {}} />
 * </FileList>
 * ```
 */
export const FileList = React.forwardRef<HTMLUListElement, FileListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={classNames('dsn-file-list', className)}
        role="list"
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    );
  }
);

FileList.displayName = 'FileList';
