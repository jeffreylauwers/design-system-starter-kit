import {
  ActionGroup,
  Button,
  Heading,
  Icon,
  Paragraph,
  Stack,
} from '@dsn-starter-kit/components-react';

export interface ExportSectionProps {
  onExportConfig: () => void;
  onExportColors: (mode: 'light' | 'dark') => void;
  onExportGeneric: () => void;
  onReset: () => void;
}

/** Downloads of the theme, and starting over from Start. */
export function ExportSection({
  onExportConfig,
  onExportColors,
  onExportGeneric,
  onReset,
}: ExportSectionProps) {
  const download = <Icon name="download" />;
  return (
    <section aria-labelledby="export-heading">
      <Stack space="lg">
        <Heading level={3} id="export-heading">
          Exporteren
        </Heading>
        <Paragraph>
          Zet <code>theme.config.json</code> in{' '}
          <code>packages/design-tokens/src/tokens/themes/start/</code> en draai{' '}
          <code>pnpm build:tokens</code>. De kleurbestanden zijn compleet: alles
          wat je hier niet instelt komt van Start.
        </Paragraph>
        <ActionGroup>
          <Button
            variant="strong"
            iconStart={download}
            onClick={onExportConfig}
          >
            theme.config.json
          </Button>
          <Button
            variant="default"
            iconStart={download}
            onClick={() => onExportColors('light')}
          >
            colors-light.json
          </Button>
          <Button
            variant="default"
            iconStart={download}
            onClick={() => onExportColors('dark')}
          >
            colors-dark.json
          </Button>
          <Button
            variant="default"
            iconStart={download}
            onClick={onExportGeneric}
          >
            Generieke JSON
          </Button>
        </ActionGroup>
        <div>
          <Button variant="subtle" onClick={onReset}>
            Terug naar Start
          </Button>
        </div>
      </Stack>
    </section>
  );
}
