import { useState } from 'react';
import {
  Button,
  CheckboxOption,
  FormField,
  Heading,
  Icon,
  NumberInput,
  Paragraph,
  Stack,
} from '@dsn-starter-kit/components-react';
import type { ColorMode } from '@dsn-starter-kit/theme-engine';
import { SegmentedControl } from '../candidates/SegmentedControl/SegmentedControl';
import type { GroupView } from '../model/theme';
import { GroupEditor } from './GroupEditor';
import type { DisplayFormat } from './GroupEditor';

export const INTENSITY_MIN = 0.3;
export const INTENSITY_MAX = 2;

const NUMBER = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });

/** "1,4" or "1.4" as a number, or null when it is not one. */
function parseNumber(text: string): number | null {
  const number = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(number) ? number : null;
}

export interface ColorPanelProps {
  groups: GroupView[];
  mode: ColorMode;
  intensity: number;
  format: DisplayFormat;
  showInverse: boolean;
  onIntensityChange: (intensity: number) => void;
  onFormatChange: (format: DisplayFormat) => void;
  onShowInverseChange: (show: boolean) => void;
  onBaseColorChange: (name: string, color: string) => void;
  onRename: (name: string, newName: string) => string | null;
  onDelete: (name: string) => void;
  onAddGroup: () => void;
  onCopy: (value: string) => void;
}

/** The color settings: intensity, display, and every color group. */
export function ColorPanel({
  groups,
  mode,
  intensity,
  format,
  showInverse,
  onIntensityChange,
  onFormatChange,
  onShowInverseChange,
  onBaseColorChange,
  onRename,
  onDelete,
  onAddGroup,
  onCopy,
}: ColorPanelProps) {
  const [intensityDraft, setIntensityDraft] = useState(
    NUMBER.format(intensity)
  );
  const [shownIntensity, setShownIntensity] = useState(intensity);
  if (intensity !== shownIntensity) {
    setShownIntensity(intensity);
    setIntensityDraft(NUMBER.format(intensity));
  }

  const parsed = parseNumber(intensityDraft);
  const intensityInvalid =
    parsed === null || parsed < INTENSITY_MIN || parsed > INTENSITY_MAX;

  function handleIntensity(text: string) {
    setIntensityDraft(text);
    const value = parseNumber(text);
    if (value !== null && value >= INTENSITY_MIN && value <= INTENSITY_MAX) {
      onIntensityChange(value);
    }
  }

  return (
    <Stack space="3xl">
      <section aria-labelledby="color-general">
        <Stack space="xl">
          <Heading level={3} id="color-general">
            Algemeen
          </Heading>
          <FormField
            label="Intensiteit"
            htmlFor="color-intensity"
            description="Van 0,3 (gedempt) tot 2 (levendig). 1 is de standaard."
            error={
              intensityInvalid
                ? 'Vul een getal in van 0,3 tot en met 2, bijvoorbeeld 1,2.'
                : undefined
            }
          >
            <NumberInput
              id="color-intensity"
              allowDecimals
              inlineSize="xs"
              value={intensityDraft}
              invalid={intensityInvalid}
              onChange={(event) => handleIntensity(event.target.value)}
            />
          </FormField>
          <SegmentedControl<DisplayFormat>
            legend="Waarden tonen als"
            options={[
              { value: 'hex', label: 'HEX' },
              { value: 'oklch', label: 'OKLCH' },
            ]}
            value={format}
            onChange={onFormatChange}
          />
          <CheckboxOption
            id="color-show-inverse"
            label="Inverse kleuren tonen"
            checked={showInverse}
            onChange={(event) => onShowInverseChange(event.target.checked)}
          />
        </Stack>
      </section>

      <section aria-labelledby="color-groups">
        <Stack space="lg">
          <Heading level={3} id="color-groups">
            Kleurgroepen
          </Heading>
          <Paragraph>
            De schakeringen zijn die van {mode} mode; wissel bij het voorbeeld.
            Activeer een kleur om de waarde te kopiëren.
          </Paragraph>
          <div className="tc-groups">
            {groups.map((group) => (
              <GroupEditor
                key={group.name}
                group={group}
                format={format}
                showInverse={showInverse}
                onBaseColorChange={onBaseColorChange}
                onRename={onRename}
                onDelete={onDelete}
                onCopy={onCopy}
              />
            ))}
          </div>
          <div>
            <Button
              variant="default"
              iconStart={<Icon name="plus" />}
              onClick={onAddGroup}
            >
              Kleurgroep toevoegen
            </Button>
          </div>
        </Stack>
      </section>
    </Stack>
  );
}
