import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack, Paragraph, Heading } from '@dsn/components-react';
import DocsPage from './Container.docs.mdx';

/** Placeholder box voor visuele demonstratie van layout binnen een Container */
const Box = ({ label }: { label?: string }) => (
  <div
    style={{
      padding: '0.75rem 1rem',
      background: 'var(--dsn-color-neutral-bg-default)',
      border: '1px solid var(--dsn-color-neutral-border-subtle)',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: 'var(--dsn-color-neutral-color-document)',
    }}
  >
    {label ?? 'Inhoud'}
  </div>
);

const meta: Meta<typeof Container> = {
  title: 'Layout Components/Container',
  component: Container,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-container',
          args.elevated && 'dsn-container--elevated',
        ]
          .filter(Boolean)
          .join(' ');
        const as = args.as ?? 'div';
        return `<${as} class="${cls}">\n  <p class="dsn-paragraph">Inhoud</p>\n</${as}>`;
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside'],
    },
    elevated: {
      control: 'boolean',
    },
    children: { control: false },
  },
  args: {
    as: 'div',
    elevated: false,
    children: <Paragraph>Inhoud van de container.</Paragraph>,
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Elevated: Story = {
  args: {
    elevated: true,
  },
};

export const ElevatedWithContent: Story = {
  name: 'Elevated met content',
  render: () => (
    <Container elevated>
      <Stack space="md">
        <Heading level={2} appearance="heading-3">
          Kaart
        </Heading>
        <Paragraph>
          Een elevated Container krijgt een lichte schaduw via{' '}
          <code>--dsn-box-shadow-sm</code>. Geschikt voor kaarten, panelen en
          demo-wrappers.
        </Paragraph>
        <Box />
      </Stack>
    </Container>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <Stack space="xl">
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--dsn-color-neutral-color-default)',
            marginBlockEnd: '0.5rem',
          }}
        >
          Default
        </div>
        <Container>
          <Paragraph>Standaard container — border, geen schaduw.</Paragraph>
        </Container>
      </div>
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--dsn-color-neutral-color-default)',
            marginBlockEnd: '0.5rem',
          }}
        >
          Elevated
        </div>
        <Container elevated>
          <Paragraph>Elevated container — border + box-shadow.sm.</Paragraph>
        </Container>
      </div>
    </Stack>
  ),
};
