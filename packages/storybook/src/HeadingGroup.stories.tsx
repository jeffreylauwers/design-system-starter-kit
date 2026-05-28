import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeadingGroup } from '@dsn-starter-kit/components-react';
import DocsPage from './HeadingGroup.docs.mdx';
import { VEEL_TEKST, VEEL_TEKST_AR, rtlDecorator } from './story-helpers';

const meta: Meta<typeof HeadingGroup> = {
  title: 'Components/HeadingGroup',
  component: HeadingGroup,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const level = args.level ?? 2;
        const appearance = args.appearance ?? `heading-${level}`;
        const preHeading = args.preHeading
          ? `\n  <span class="dsn-pre-heading">${args.preHeading}</span>`
          : '';
        return `<h${level} class="dsn-heading dsn-heading--${appearance} dsn-heading-group">${preHeading}\n  ${args.children ?? 'Uw gegevens'}\n</h${level}>`;
      },
    },
  },
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    appearance: {
      control: 'select',
      options: [
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-6',
      ],
    },
  },
  args: {
    level: 2,
    preHeading: 'Stap 2',
    children: 'Uw gegevens',
  },
};

export default meta;
type Story = StoryObj<typeof HeadingGroup>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithStep: Story = {
  name: 'With Step',
  render: () => (
    <HeadingGroup
      level={2}
      preHeading={
        <>
          Stap 2<span className="dsn-visually-hidden">:</span>
        </>
      }
    >
      Uw gegevens
    </HeadingGroup>
  ),
};

export const WithCategory: Story = {
  name: 'With Category',
  render: () => (
    <HeadingGroup level={2} preHeading="Diensten">
      We helpen u groeien
    </HeadingGroup>
  ),
};

export const Level1: Story = {
  name: 'Level 1',
  render: () => (
    <HeadingGroup level={1} preHeading="Meerstappenformulier">
      Uw aanvraag
    </HeadingGroup>
  ),
};

export const DifferentAppearance: Story = {
  name: 'Different Appearance',
  render: () => (
    <HeadingGroup level={1} appearance="heading-2" preHeading="Stap 1 van 4">
      Persoonlijke gegevens
    </HeadingGroup>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllLevels: Story = {
  name: 'All Levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <HeadingGroup level={1} preHeading="Stap 1">
        Heading 1
      </HeadingGroup>
      <HeadingGroup level={2} preHeading="Stap 2">
        Heading 2
      </HeadingGroup>
      <HeadingGroup level={3} preHeading="Stap 3">
        Heading 3
      </HeadingGroup>
      <HeadingGroup level={4} preHeading="Stap 4">
        Heading 4
      </HeadingGroup>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const LongText: Story = {
  name: 'Long Text',
  render: () => (
    <HeadingGroup level={2} preHeading={VEEL_TEKST}>
      {VEEL_TEKST}
    </HeadingGroup>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <HeadingGroup level={1} preHeading={VEEL_TEKST_AR}>
        {VEEL_TEKST_AR}
      </HeadingGroup>
      <HeadingGroup level={2} preHeading={VEEL_TEKST_AR}>
        {VEEL_TEKST_AR}
      </HeadingGroup>
    </div>
  ),
};
