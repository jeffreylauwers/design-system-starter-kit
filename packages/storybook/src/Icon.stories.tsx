import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@dsn/components-react';
import type { IconName } from '@dsn/components-react/icon-registry.generated';
import DocsPage from './Icon.docs.mdx';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    docs: {
      page: DocsPage,
    },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const size = args.size ?? 'md';
        const cls = ['dsn-icon', size !== 'md' && `dsn-icon--${size}`]
          .filter(Boolean)
          .join(' ');
        const ariaAttrs = args['aria-label']
          ? `aria-label="${args['aria-label']}" role="img"`
          : 'aria-hidden="true"';
        return `<svg class="${cls}" ${ariaAttrs}>\n  <!-- ${args.name ?? 'check'} icon via Tabler Icons -->\n</svg>`;
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: [
        'alert-triangle',
        'archive',
        'arrow-down',
        'arrow-left',
        'arrow-narrow-down',
        'arrow-narrow-up',
        'arrow-right',
        'arrow-up',
        'bell',
        'calendar-event',
        'check',
        'chevron-down',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'circle-check',
        'clock',
        'dots-vertical',
        'download',
        'edit',
        'exclamation-circle',
        'external-link',
        'eye',
        'file-description',
        'folder',
        'heart-filled',
        'heart',
        'home',
        'info-circle',
        'loader',
        'mail',
        'menu',
        'message-circle',
        'minus',
        'paperclip',
        'plus',
        'search',
        'selector',
        'settings',
        'star-filled',
        'star',
        'trash',
        'upload',
        'user',
        'x',
      ] as IconName[],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    'aria-label': { control: 'text' },
  },
  args: {
    name: 'check',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {};

// =============================================================================
// VARIANTEN
// =============================================================================

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name="check" size={size} />
          <span style={{ fontSize: '0.75rem' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {[
        'alert-triangle',
        'archive',
        'arrow-down',
        'arrow-left',
        'arrow-narrow-down',
        'arrow-narrow-up',
        'arrow-right',
        'arrow-up',
        'bell',
        'calendar-event',
        'check',
        'chevron-down',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'circle-check',
        'clock',
        'dots-vertical',
        'download',
        'edit',
        'exclamation-circle',
        'external-link',
        'eye',
        'file-description',
        'folder',
        'heart-filled',
        'heart',
        'home',
        'info-circle',
        'loader',
        'mail',
        'menu',
        'message-circle',
        'minus',
        'paperclip',
        'plus',
        'search',
        'selector',
        'settings',
        'star-filled',
        'star',
        'trash',
        'upload',
        'user',
        'x',
      ].map((iconName) => (
        <div
          key={iconName}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name={iconName as IconName} size="lg" />
          <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>
            {iconName}
          </span>
        </div>
      ))}
    </div>
  ),
};
