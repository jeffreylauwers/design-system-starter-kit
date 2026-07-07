import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents } from '@dsn-starter-kit/components-react';
import DocsPage from './TableOfContents.docs.mdx';
import {
  WEINIG_TEKST,
  VEEL_TEKST,
  TEKST_AR,
  VEEL_TEKST_AR,
  rtlDecorator,
} from './story-helpers';

const demoItems = [
  { id: 'sectie-kenmerken', label: 'Kenmerken' },
  { id: 'sectie-gebruik', label: 'Gebruik' },
  { id: 'sectie-toegankelijkheid', label: 'Toegankelijkheid' },
];

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const appearance = args.appearance ?? 'framed';
        const headingLevel = args.headingLevel ?? 2;
        const headingAppearance =
          appearance === 'plain' ? 'heading-5' : 'heading-3';
        const heading = args.heading ?? 'Op deze pagina';
        const cls = [
          'dsn-table-of-contents',
          appearance === 'plain' && 'dsn-table-of-contents--plain',
        ]
          .filter(Boolean)
          .join(' ');

        return `<nav class="${cls}" aria-labelledby="toc-heading">
  <h${headingLevel} class="dsn-heading dsn-heading--${headingAppearance} dsn-table-of-contents__heading" id="toc-heading">${heading}</h${headingLevel}>
  <ul class="dsn-unordered-list">
    <li><a class="dsn-link" href="#sectie-kenmerken">Kenmerken</a></li>
    <li><a class="dsn-link" href="#sectie-gebruik">Gebruik</a></li>
    <li><a class="dsn-link" href="#sectie-toegankelijkheid">Toegankelijkheid</a></li>
  </ul>
</nav>`;
      },
    },
  },
  argTypes: {
    heading: { control: 'text' },
    headingLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    appearance: {
      control: 'select',
      options: ['framed', 'plain'],
    },
    items: { control: false },
  },
  args: {
    heading: 'Op deze pagina',
    headingLevel: 2,
    appearance: 'framed',
    items: demoItems,
  },
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Plain: Story = {
  name: 'Plain',
  args: {
    appearance: 'plain',
  },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <TableOfContents items={demoItems} />
      <TableOfContents appearance="plain" items={demoItems} />
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  args: {
    heading: WEINIG_TEKST,
    items: [{ id: 'sectie-1', label: WEINIG_TEKST }],
  },
};

export const LongText: Story = {
  name: 'Long text',
  args: {
    heading: VEEL_TEKST,
    items: [
      { id: 'sectie-1', label: VEEL_TEKST },
      { id: 'sectie-2', label: 'Gebruik' },
    ],
  },
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <TableOfContents
        heading={TEKST_AR}
        items={[{ id: 'sectie-1', label: TEKST_AR }]}
      />
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  decorators: [rtlDecorator],
  render: () => (
    <div dir="rtl" lang="ar">
      <TableOfContents
        heading={VEEL_TEKST_AR}
        items={[{ id: 'sectie-1', label: VEEL_TEKST_AR }]}
      />
    </div>
  ),
};
