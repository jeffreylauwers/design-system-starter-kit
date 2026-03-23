import type { Meta, StoryObj } from '@storybook/react';
import {
  BreadcrumbNavigation,
  BreadcrumbNavigationItem,
  type BreadcrumbNavigationProps,
} from '@dsn/components-react';
import DocsPage from './BreadcrumbNavigation.docs.mdx';
import { rtlDecorator } from './story-helpers';

const meta: Meta<typeof BreadcrumbNavigation> = {
  title: 'Components/BreadcrumbNavigation',
  component: BreadcrumbNavigation,
  parameters: {
    docs: { page: DocsPage },
    dsn: {
      htmlTemplate:
        () => `<nav aria-label="Broodkruimelpad" class="dsn-breadcrumb-navigation">
  <ol class="dsn-breadcrumb-navigation__list">
    <li class="dsn-breadcrumb-navigation__item">
      <a href="/home" class="dsn-breadcrumb-navigation__link">Home</a>
      <svg class="dsn-icon dsn-breadcrumb-navigation__separator" aria-hidden="true"><!-- chevron-right --></svg>
    </li>
    <li class="dsn-breadcrumb-navigation__item">
      <a href="/supermarkt" class="dsn-breadcrumb-navigation__link">Supermarkt</a>
      <svg class="dsn-icon dsn-breadcrumb-navigation__separator" aria-hidden="true"><!-- chevron-right --></svg>
    </li>
    <li class="dsn-breadcrumb-navigation__item dsn-breadcrumb-navigation__item--current">
      <a href="/fruit" class="dsn-breadcrumb-navigation__link" aria-current="page">Fruit</a>
      <svg class="dsn-icon dsn-breadcrumb-navigation__separator" aria-hidden="true"><!-- chevron-right --></svg>
    </li>
  </ol>
</nav>`,
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    'aria-label': { control: 'text' },
    children: { control: false },
  },
  args: {
    variant: 'default',
    'aria-label': 'Broodkruimelpad',
  },
};

export default meta;
type Story = StoryObj<typeof BreadcrumbNavigation>;

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  name: 'Default',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/appel" current>
        Appel
      </BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Compact: Story = {
  name: 'Compact',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args} variant="compact">
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/appel" current>
        Appel
      </BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

export const TwoItems: Story = {
  name: 'Two items — minimal path',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/appel" current>
        Appel
      </BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

export const ManyItems: Story = {
  name: 'Many items — long path',
  render: (args: BreadcrumbNavigationProps) => (
    <BreadcrumbNavigation {...args}>
      <BreadcrumbNavigationItem href="/home">Home</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/supermarkt">
        Supermarkt
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/afdeling">
        Afdeling
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/categorie">
        Categorie
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/subcategorie">
        Subcategorie
      </BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/fruit">Fruit</BreadcrumbNavigationItem>
      <BreadcrumbNavigationItem href="/appel" current>
        Appel
      </BreadcrumbNavigationItem>
    </BreadcrumbNavigation>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  decorators: [rtlDecorator],
  render: (args: BreadcrumbNavigationProps) => (
    <div dir="rtl" lang="ar">
      <BreadcrumbNavigation {...args} aria-label="مسار التنقل">
        <BreadcrumbNavigationItem href="/home">
          الرئيسية
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem href="/supermarkt">
          السوبرماركت
        </BreadcrumbNavigationItem>
        <BreadcrumbNavigationItem href="/fruit" current>
          الفاكهة
        </BreadcrumbNavigationItem>
      </BreadcrumbNavigation>
    </div>
  ),
};
