import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Body,
  FormField,
  PageBody,
  PageLayout,
  Select,
} from '@dsn-starter-kit/components-react';
import type { ColorMode } from '@dsn-starter-kit/theme-engine';
import { SegmentedControl } from '../candidates/SegmentedControl/SegmentedControl';
import { changedTokens } from '../model/theme';
import type { ThemeConfig } from '../model/theme';
import { PreviewFrame } from './PreviewFrame';
import { PREVIEW_LINKS, loadTokenCss, previewStyles } from './previewStyles';
import type { Density } from './previewStyles';
import { ArticleScene } from './scenes/ArticleScene';
import { ComponentsScene } from './scenes/ComponentsScene';
import { FormScene } from './scenes/FormScene';
import { PageScene } from './scenes/PageScene';

export type Scene = 'components' | 'page' | 'form' | 'article';
export type Viewport = '360' | '768' | '1280' | 'fit';

const SCENES: { value: Scene; label: string }[] = [
  { value: 'components', label: 'Componenten' },
  { value: 'page', label: 'Pagina' },
  { value: 'form', label: 'Formulier' },
  { value: 'article', label: 'Artikel' },
];

/** The frame's own page: Start's background behind every scene. */
const FRAME_BASE_CSS = `html, body {
  margin: 0;
  min-block-size: 100%;
  background-color: var(--dsn-color-neutral-bg-document);
}
.dsn-body {
  min-block-size: 100vh;
}`;

function SceneContent({ scene }: { scene: Scene }) {
  if (scene === 'page') return <PageScene />;
  const content = {
    components: <ComponentsScene />,
    form: <FormScene />,
    article: <ArticleScene />,
  }[scene];
  return (
    <PageLayout>
      <PageBody>
        <main
          style={{
            paddingBlock: 'var(--dsn-space-block-4xl)',
          }}
        >
          {content}
        </main>
      </PageBody>
    </PageLayout>
  );
}

/** Width and height of an element, kept up to date. */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export interface PreviewProps {
  config: ThemeConfig;
  mode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
}

/**
 * The preview: a toolbar and a frame that shows a scene with the configured
 * theme. Only the frame gets the theme; the configurator around it stays
 * Start dark.
 */
export function Preview({ config, mode, onModeChange }: PreviewProps) {
  const [scene, setScene] = useState<Scene>('components');
  const [viewport, setViewport] = useState<Viewport>('fit');
  const [density, setDensity] = useState<Density>('default');
  const [stageRef, stage] = useSize<HTMLDivElement>();

  // Start's tokens for this mode and density. Until a combination has
  // loaded, the previous one stays, so the preview does not flash.
  const [tokensCss, setTokensCss] = useState('');
  useEffect(() => {
    let current = true;
    loadTokenCss(mode, density).then((css) => {
      if (current) setTokensCss(css);
    });
    return () => {
      current = false;
    };
  }, [mode, density]);

  const styles = useMemo(
    () => [
      { id: 'base', css: FRAME_BASE_CSS },
      ...previewStyles(tokensCss, changedTokens(config, mode)),
    ],
    [config, mode, tokensCss]
  );

  // A viewport wider than the stage is shown scaled down, so the layout is
  // the one of that viewport, just smaller.
  const width = viewport === 'fit' ? stage.width : Number(viewport);
  const scale = width > stage.width && width > 0 ? stage.width / width : 1;

  return (
    <div className="tc-preview__inner">
      <div className="tc-preview__toolbar">
        <FormField label="Scène" htmlFor="preview-scene">
          <Select
            id="preview-scene"
            value={scene}
            onChange={(event) => setScene(event.target.value as Scene)}
          >
            {SCENES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <SegmentedControl
          legend="Modus"
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={mode}
          onChange={onModeChange}
        />
        <SegmentedControl<Viewport>
          legend="Viewport"
          options={[
            { value: '360', label: '360' },
            { value: '768', label: '768' },
            { value: '1280', label: '1280' },
            { value: 'fit', label: 'Passend' },
          ]}
          value={viewport}
          onChange={setViewport}
        />
        <SegmentedControl<Density>
          legend="Dichtheid"
          options={[
            { value: 'default', label: 'Standaard' },
            { value: 'information-dense', label: 'Compact' },
          ]}
          value={density}
          onChange={setDensity}
        />
      </div>
      <div ref={stageRef} className="tc-preview__stage">
        <div
          className="tc-preview__viewport"
          style={{
            inlineSize: width * scale || '100%',
            blockSize: stage.height || '100%',
          }}
        >
          <PreviewFrame
            title={`Voorbeeld van het thema: ${SCENES.find((item) => item.value === scene)?.label}`}
            links={PREVIEW_LINKS}
            styles={styles}
            className="tc-preview__frame"
            style={{
              inlineSize: width || '100%',
              blockSize: stage.height ? stage.height / scale : '100%',
              transform: scale === 1 ? undefined : `scale(${scale})`,
            }}
          >
            <Body>
              <SceneContent scene={scene} />
            </Body>
          </PreviewFrame>
        </div>
      </div>
    </div>
  );
}
