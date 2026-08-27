import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Link,
  Logo,
  PageFooter,
  Paragraph,
  UnorderedList,
} from '@dsn-starter-kit/components-react';
import { rtlDecorator } from './story-helpers';

// =============================================================================
// META
// =============================================================================

const slot1 = (
  <a href="/">
    <Logo aria-hidden={true} />
    <span className="dsn-visually-hidden">
      Starter Kit — terug naar homepage
    </span>
  </a>
);

const slot2 = (
  <Paragraph>
    Dit is een voorbeeldorganisatie. <Link href="/about">Meer informatie</Link>.
  </Paragraph>
);

const slot3 = (
  <UnorderedList>
    <li>
      <Link href="/nieuws">Nieuws</Link>
    </li>
    <li>
      <Link href="/over-ons">Over ons</Link>
    </li>
    <li>
      <Link href="/werken-bij">Werken bij</Link>
    </li>
    <li>
      <Link href="/klachten">Klachten</Link>
    </li>
  </UnorderedList>
);

const slot4 = (
  <UnorderedList>
    <li>
      <Link href="/privacy">Privacyverklaring</Link>
    </li>
    <li>
      <Link href="/accessibility">Toegankelijkheid</Link>
    </li>
    <li>
      <Link href="/cookies">Cookies</Link>
    </li>
    <li>
      <Link href="/contact">Contact</Link>
    </li>
  </UnorderedList>
);

// =============================================================================
// ARABISCHE CONTENT (voor RTL stories)
// =============================================================================

const slot1AR = (
  <a href="/">
    <Logo aria-hidden={true} />
    <span className="dsn-visually-hidden">
      Starter Kit — العودة إلى الصفحة الرئيسية
    </span>
  </a>
);

const slot2AR = (
  <Paragraph>
    هذه منظمة نموذجية. <Link href="/about">مزيد من المعلومات</Link>.
  </Paragraph>
);

const slot3AR = (
  <UnorderedList>
    <li>
      <Link href="/nieuws">أخبار</Link>
    </li>
    <li>
      <Link href="/over-ons">عن المنظمة</Link>
    </li>
    <li>
      <Link href="/werken-bij">الوظائف</Link>
    </li>
    <li>
      <Link href="/klachten">الشكاوى</Link>
    </li>
  </UnorderedList>
);

const slot4AR = (
  <UnorderedList>
    <li>
      <Link href="/privacy">سياسة الخصوصية</Link>
    </li>
    <li>
      <Link href="/accessibility">إمكانية الوصول</Link>
    </li>
    <li>
      <Link href="/cookies">ملفات تعريف الارتباط</Link>
    </li>
    <li>
      <Link href="/contact">اتصل بنا</Link>
    </li>
  </UnorderedList>
);

const meta: Meta<typeof PageFooter> = {
  title: 'Components/PageFooter',
  component: PageFooter,
  parameters: {
    layout: 'fullscreen',
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (_args: any) => {
        const isInverse = _args.colorScheme === 'inverse';
        return `<footer class="dsn-page-footer${isInverse ? ' dsn-page-footer--inverse' : ''}">
  <div class="dsn-page-footer__inner">
    <div class="dsn-grid">
      <div class="dsn-col-12 dsn-col-lg-3">
        <a href="/">
          <svg class="dsn-logo" aria-hidden="true"><!-- Logo SVG --></svg>
          <span class="dsn-visually-hidden">Starter Kit — terug naar homepage</span>
        </a>
      </div>
      <div class="dsn-col-12 dsn-col-lg-3">
        <p class="dsn-paragraph">
          Dit is een voorbeeldorganisatie.
          <a class="dsn-link" href="/about">Meer informatie</a>.
        </p>
      </div>
      <div class="dsn-col-12 dsn-col-lg-3">
        <ul class="dsn-unordered-list">
          <li><a class="dsn-link" href="/nieuws">Nieuws</a></li>
          <li><a class="dsn-link" href="/over-ons">Over ons</a></li>
          <li><a class="dsn-link" href="/werken-bij">Werken bij</a></li>
          <li><a class="dsn-link" href="/klachten">Klachten</a></li>
        </ul>
      </div>
      <div class="dsn-col-12 dsn-col-lg-3">
        <ul class="dsn-unordered-list">
          <li><a class="dsn-link" href="/privacy">Privacyverklaring</a></li>
          <li><a class="dsn-link" href="/accessibility">Toegankelijkheid</a></li>
          <li><a class="dsn-link" href="/cookies">Cookies</a></li>
          <li><a class="dsn-link" href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>`;
      },
    },
  },
  args: {
    slot1,
    slot2,
    slot3,
    slot4,
  },
  argTypes: {
    colorScheme: {
      control: { type: 'radio' },
      options: ['default', 'inverse'],
      description:
        'Kleurschema: `default` (accent-1) of `inverse` (accent-1-inverse)',
    },
    slot1: { control: false },
    slot2: { control: false },
    slot3: { control: false },
    slot4: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof PageFooter>;

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {};

export const Inverse: Story = {
  args: {
    colorScheme: 'inverse',
  },
  parameters: {
    docs: {
      description: {
        story:
          'De inverse kleurvariant (`colorScheme="inverse"`) gebruikt de `accent-1-inverse` achtergrond. Tekst- en linkkleuren schakelen automatisch via CSS custom property overrides voor voldoende contrast.',
      },
    },
  },
};

export const AllVariants: Story = {
  name: 'Alle varianten',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageFooter slot1={slot1} slot2={slot2} slot3={slot3} slot4={slot4} />
      <PageFooter
        colorScheme="inverse"
        slot1={slot1}
        slot2={slot2}
        slot3={slot3}
        slot4={slot4}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Overzicht van beide kleurvarianten: `default` (accent-1) en `inverse` (accent-1-inverse).',
      },
    },
  },
};

export const DefaultRTL: Story = {
  name: 'Default: RTL',
  decorators: [rtlDecorator],
  args: {
    slot1: slot1AR,
    slot2: slot2AR,
    slot3: slot3AR,
    slot4: slot4AR,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Right-to-left layout (Arabisch). De vier grid-slots worden gespiegeld: logo staat inline-end, links inline-start. CSS logische eigenschappen spiegelen automatisch.',
      },
    },
  },
};
