import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Hero,
  Stack,
  Heading,
  Paragraph,
  ActionGroup,
  ButtonLink,
  Button,
  SearchInput,
} from '@dsn-starter-kit/components-react';
import DocsPage from './Hero.docs.mdx';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: { page: DocsPage },
    dsn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      htmlTemplate: (args: any) => {
        const cls = [
          'dsn-hero',
          args.variant === 'inverse' && 'dsn-hero--inverse',
          (args.variant === 'image' || args.variant === 'image-blend') &&
            'dsn-hero--image',
          args.variant === 'image-blend' && 'dsn-hero--image-blend',
          args.align === 'center' && 'dsn-hero--align-center',
        ]
          .filter(Boolean)
          .join(' ');
        const styleAttr = args.backgroundImage
          ? ` style="--dsn-hero-bg-image: url('${args.backgroundImage}')"`
          : '';
        return `<section class="${cls}" aria-labelledby="hero-heading"${styleAttr}>\n  <div class="dsn-hero__inner">\n    <div class="dsn-hero__content">\n      <div class="dsn-stack dsn-stack--space-lg">\n        <h1 class="dsn-heading dsn-heading--heading-1" id="hero-heading">Paginatitel</h1>\n        <p class="dsn-paragraph dsn-paragraph--lead">Introductietekst die de kernboodschap samenvat in één of twee zinnen.</p>\n        <ul class="dsn-action-group" aria-label="Acties">\n          <li class="dsn-action-group__item"><a href="#" class="dsn-button dsn-button--strong dsn-button--size-large dsn-button-link"><span class="dsn-button__label">Aan de slag</span></a></li>\n          <li class="dsn-action-group__item"><a href="#" class="dsn-button dsn-button--subtle dsn-button--size-large dsn-button-link"><span class="dsn-button__label">Meer informatie</span></a></li>\n        </ul>\n      </div>\n    </div>\n  </div>\n</section>`;
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'inverse', 'image', 'image-blend'],
    },
    align: {
      control: 'select',
      options: ['start', 'center'],
    },
    backgroundImage: { control: 'text' },
    children: { control: false },
  },
  args: {
    variant: 'default',
    align: 'start',
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

// Simuleert de paginastructuur: de Hero staat als directe child van de outer
// overflow-x: clip container (net als dsn-page-body), zodat margin-inline: calc(50% - 50vw)
// correct wordt berekend. De voor- en na-content is herbeperkt tot 960px.
function ConstrainedPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'clip' }}>
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>Normale paginainhoud boven de Hero.</Paragraph>
      </div>
      {children}
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>Normale paginainhoud onder de Hero.</Paragraph>
      </div>
    </div>
  );
}

const IMAGE_URL = 'https://picsum.photos/id/1043/1600/900';

// =============================================================================
// DEFAULT
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} aria-labelledby="hero-heading-default">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-default">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
            <ButtonLink href="#" variant="subtle" size="large">
              Meer informatie
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

// =============================================================================
// VARIANTEN
// =============================================================================

export const Inverse: Story = {
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} variant="inverse" aria-labelledby="hero-heading-inverse">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-inverse">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
            <ButtonLink href="#" variant="subtle" size="large">
              Meer informatie
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const WithImage: Story = {
  name: 'With image',
  render: (args) => (
    <ConstrainedPage>
      <Hero
        {...args}
        variant="image"
        backgroundImage={IMAGE_URL}
        aria-labelledby="hero-heading-image"
      >
        <Stack space="lg">
          <Heading level={1} id="hero-heading-image">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const WithImageBlend: Story = {
  name: 'With image blend',
  render: (args) => (
    <ConstrainedPage>
      <Hero
        {...args}
        variant="image-blend"
        backgroundImage={IMAGE_URL}
        aria-labelledby="hero-heading-image-blend"
      >
        <Stack space="lg">
          <Heading level={1} id="hero-heading-image-blend">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const AlignCenter: Story = {
  name: 'Align center',
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} align="center" aria-labelledby="hero-heading-center">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-center">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
            <ButtonLink href="#" variant="subtle" size="large">
              Meer informatie
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const WithSearch: Story = {
  name: 'With search',
  render: (args) => (
    <ConstrainedPage>
      <Hero
        {...args}
        variant="inverse"
        align="center"
        aria-labelledby="hero-heading-search"
      >
        <Stack space="lg">
          <Heading level={1} id="hero-heading-search">
            Wat zoekt u?
          </Heading>
          <Paragraph variant="lead">
            Zoek in ons aanbod van diensten en informatie.
          </Paragraph>
          <div className="dsn-hero__searchbox">
            <SearchInput aria-label="Zoekterm" placeholder="Zoek…" />
            <Button variant="strong">Zoeken</Button>
          </div>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const WithSingleButton: Story = {
  name: 'With single button',
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} aria-labelledby="hero-heading-single">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-single">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat in één of twee
            zinnen.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

// =============================================================================
// WITHOUT INNER CONSTRAINT
// =============================================================================

export const WithoutInnerConstraint: Story = {
  name: 'Without inner constraint',
  render: (args) => (
    <ConstrainedPage>
      <Hero
        {...args}
        variant="image-blend"
        backgroundImage={IMAGE_URL}
        aria-labelledby="hero-heading-no-constraint"
        style={{ '--dsn-page-max-inline-size': 'none' } as React.CSSProperties}
      >
        <Stack space="lg">
          <Heading level={1} id="hero-heading-no-constraint">
            Paginatitel
          </Heading>
          <Paragraph variant="lead">
            Met <code>--dsn-page-max-inline-size: none</code> loopt de inhoud
            van rand tot rand mee. Passend voor afbeeldingen of visuele secties;
            minder geschikt voor lopende tekst.
          </Paragraph>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

// =============================================================================
// OVERZICHTSSTORIES
// =============================================================================

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ overflowX: 'clip' }}>
      <Hero variant="default" aria-labelledby="hero-all-default">
        <Stack space="lg">
          <Heading level={2} id="hero-all-default">
            Default
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat.
          </Paragraph>
        </Stack>
      </Hero>
      <Hero variant="inverse" aria-labelledby="hero-all-inverse">
        <Stack space="lg">
          <Heading level={2} id="hero-all-inverse">
            Inverse
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat.
          </Paragraph>
        </Stack>
      </Hero>
      <Hero
        variant="image"
        backgroundImage={IMAGE_URL}
        aria-labelledby="hero-all-image"
      >
        <Stack space="lg">
          <Heading level={2} id="hero-all-image">
            Image
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat.
          </Paragraph>
        </Stack>
      </Hero>
      <Hero
        variant="image-blend"
        backgroundImage={IMAGE_URL}
        aria-labelledby="hero-all-blend"
      >
        <Stack space="lg">
          <Heading level={2} id="hero-all-blend">
            Image blend
          </Heading>
          <Paragraph variant="lead">
            Introductietekst die de kernboodschap samenvat.
          </Paragraph>
        </Stack>
      </Hero>
    </div>
  ),
};

// =============================================================================
// TEKST VARIANTEN
// =============================================================================

export const ShortText: Story = {
  name: 'Short text',
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} aria-labelledby="hero-heading-short">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-short">
            Korte kop
          </Heading>
          <Paragraph variant="lead">Kort intro.</Paragraph>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

export const LongText: Story = {
  name: 'Long text',
  render: (args) => (
    <ConstrainedPage>
      <Hero {...args} aria-labelledby="hero-heading-long">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-long">
            Een langere paginatitel die over meerdere regels kan lopen op smalle
            viewports
          </Heading>
          <Paragraph variant="lead">
            Dit is een langere introductietekst om te tonen hoe de Hero omgaat
            met meer inhoud. De tekst beslaat meerdere zinnen en geeft een
            bredere indruk van de pagina-inhoud die volgt. Gebruik een
            lead-alinea van maximaal twee à drie zinnen voor de beste
            leesbaarheid.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              Aan de slag
            </ButtonLink>
            <ButtonLink href="#" variant="subtle" size="large">
              Meer informatie
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
    </ConstrainedPage>
  ),
};

// =============================================================================
// RTL
// =============================================================================

export const RTL: Story = {
  name: 'RTL',
  render: (args) => (
    <div dir="rtl" style={{ overflowX: 'clip' }}>
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>محتوى الصفحة العادي فوق Hero.</Paragraph>
      </div>
      <Hero {...args} aria-labelledby="hero-heading-rtl">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-rtl">
            عنوان الصفحة
          </Heading>
          <Paragraph variant="lead">
            نص تمهيدي يلخص الرسالة الرئيسية في جملة أو جملتين.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              ابدأ
            </ButtonLink>
            <ButtonLink href="#" variant="subtle" size="large">
              المزيد من المعلومات
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>محتوى الصفحة العادي تحت Hero.</Paragraph>
      </div>
    </div>
  ),
};

export const RTLLongText: Story = {
  name: 'RTL long text',
  render: (args) => (
    <div dir="rtl" style={{ overflowX: 'clip' }}>
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>محتوى الصفحة العادي فوق Hero.</Paragraph>
      </div>
      <Hero {...args} aria-labelledby="hero-heading-rtl-long">
        <Stack space="lg">
          <Heading level={1} id="hero-heading-rtl-long">
            عنوان صفحة أطول يمتد على عدة أسطر في أجهزة العرض الضيقة
          </Heading>
          <Paragraph variant="lead">
            هذا نص تمهيدي أطول لإظهار كيفية تعامل البطل مع المحتوى الإضافي. يغطي
            النص عدة جمل ويعطي انطباعًا أوسع عن محتوى الصفحة التالي.
          </Paragraph>
          <ActionGroup>
            <ButtonLink href="#" variant="strong" size="large">
              ابدأ
            </ButtonLink>
          </ActionGroup>
        </Stack>
      </Hero>
      <div
        style={{
          maxInlineSize: '960px',
          marginInline: 'auto',
          paddingInline: 'var(--dsn-space-inline-3xl)',
          paddingBlock: 'var(--dsn-space-block-4xl)',
        }}
      >
        <Paragraph>محتوى الصفحة العادي تحت Hero.</Paragraph>
      </div>
    </div>
  ),
};
