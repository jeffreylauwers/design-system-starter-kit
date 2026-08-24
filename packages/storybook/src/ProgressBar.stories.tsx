import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from '@dsn-starter-kit/components-react';
import DocsPage from './ProgressBar.docs.mdx';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const value = args.value ?? 35;
        const max = args.max ?? 100;
        const percentage = Math.round((value / max) * 100);
        const label = args.label ?? 'Bestand uploaden';
        const description = args.description
          ? `\n  <p class="dsn-paragraph dsn-progress-bar__description" id="pb-example-description">${args.description}</p>`
          : '';
        const describedBy = args.description
          ? ' aria-describedby="pb-example-description"'
          : '';
        return `<div class="dsn-progress-bar">
  <label class="dsn-visually-hidden" for="pb-example">${label}</label>
  <div class="dsn-progress-bar__header">
    <p class="dsn-paragraph dsn-progress-bar__percentage" aria-hidden="true">${percentage}%</p>
  </div>
  <progress id="pb-example" class="dsn-progress-bar__bar" value="${value}" max="${max}"${describedBy}>${percentage}%</progress>${description}
</div>`;
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: { type: 'number', min: 1 } },
    label: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    label: 'Bestand uploaden',
    value: 35,
    max: 100,
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

export const WithDescription: Story = {
  name: 'Met beschrijving',
  args: {
    value: 35,
    description: 'Bestand wordt geüpload, even geduld...',
  },
};

export const AtStart: Story = {
  name: 'Begin (0%)',
  args: {
    value: 0,
  },
};

export const AtEnd: Story = {
  name: 'Voltooid (100%)',
  args: {
    value: 100,
    description: 'Upload voltooid.',
  },
};

export const CustomMax: Story = {
  name: 'Aangepast maximum (stap 3 van 7)',
  args: {
    label: 'Stap voortgang',
    value: 3,
    max: 7,
    description: 'Stap 3 van 7: Gegevens verwerken',
  },
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllStates: Story = {
  name: 'Alle stappen',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '480px',
      }}
    >
      {[0, 25, 50, 75, 100].map((value) => (
        <ProgressBar
          key={value}
          label={`Voortgang ${value}%`}
          value={value}
          description={value === 100 ? 'Upload voltooid.' : undefined}
        />
      ))}
    </div>
  ),
};
