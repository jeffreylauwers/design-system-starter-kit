import { useId, useState } from 'react';
import {
  Button,
  Details,
  FormField,
  Icon,
  Stack,
  TextInput,
} from '@dsn-starter-kit/components-react';
import {
  INVERSE_TOKEN_STEPS,
  TOKEN_STEPS,
  formatColor,
  isValidColor,
  oklchToHex,
  parseToOklch,
} from '@dsn-starter-kit/theme-engine';
import type { SwatchData } from '@dsn-starter-kit/theme-engine';
import { ColorInput } from '../candidates/ColorInput/ColorInput';
import { ColorSwatch } from '../candidates/ColorSwatch/ColorSwatch';
import type { GroupView } from '../model/theme';

export type DisplayFormat = 'hex' | 'oklch';

const TRACKS = [
  { label: 'Achtergronden', prefix: 'bg-' },
  { label: 'Randen', prefix: 'border-' },
  { label: 'Tekst en iconen', prefix: 'color-' },
];

function pickerValue(color: string): string {
  const oklch = parseToOklch(color);
  return oklch ? oklchToHex(oklch) : '#000000';
}

interface SwatchListProps {
  label: string;
  swatches: [string, SwatchData][];
  format: DisplayFormat;
  onCopy: (value: string) => void;
}

function SwatchList({ label, swatches, format, onCopy }: SwatchListProps) {
  const labelId = useId();
  return (
    <div className="tc-track">
      <p className="tc-track__label" id={labelId}>
        {label}
      </p>
      {/* role="list": Safari drops list semantics when list-style is none. */}
      <ul className="tc-swatches" role="list" aria-labelledby={labelId}>
        {swatches.map(([step, data]) => {
          const value = formatColor(data.oklch, format);
          return (
            <li key={step}>
              <ColorSwatch
                color={data.hex}
                name={step}
                value={value}
                contrast={
                  data.contrastVsBgDefault !== undefined &&
                  data.contrastRequired !== undefined
                    ? {
                        ratio: data.contrastVsBgDefault,
                        required: data.contrastRequired,
                      }
                    : undefined
                }
                note={data.isFallback ? 'gelijk aan color-default' : undefined}
                onClick={() => onCopy(value)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface GroupEditorProps {
  group: GroupView;
  format: DisplayFormat;
  showInverse: boolean;
  onBaseColorChange: (name: string, color: string) => void;
  /** Returns why the name cannot be used, or null when it was renamed. */
  onRename: (name: string, newName: string) => string | null;
  onDelete: (name: string) => void;
  onCopy: (value: string) => void;
}

/** One color group: its base color, its name and all its shades. */
export function GroupEditor({
  group,
  format,
  showInverse,
  onBaseColorChange,
  onRename,
  onDelete,
  onCopy,
}: GroupEditorProps) {
  const [colorDraft, setColorDraft] = useState(group.baseColor);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [nameError, setNameError] = useState<string | null>(null);

  // Follow the base color when it changes elsewhere: back to Start, or a
  // reference that becomes its own color.
  const [shownBase, setShownBase] = useState(group.baseColor);
  if (group.baseColor !== shownBase) {
    setShownBase(group.baseColor);
    setColorDraft(group.baseColor);
  }

  const colorInvalid = colorDraft.trim() !== '' && !isValidColor(colorDraft);
  const id = `group-${group.name}`;

  function handleColor(value: string) {
    setColorDraft(value);
    if (isValidColor(value) && value !== group.baseColor) {
      onBaseColorChange(group.name, value);
    }
  }

  function handleRename() {
    const problem = onRename(group.name, nameDraft.trim());
    setNameError(problem);
  }

  const tracks = (inverse: boolean) =>
    TRACKS.map(({ label, prefix }) => {
      const steps = inverse ? INVERSE_TOKEN_STEPS : TOKEN_STEPS;
      const tokens = inverse ? group.inverseTokens : group.tokens;
      const swatches = steps
        .filter((step) => step.replace('inverse-', '').startsWith(prefix))
        .map(
          (step) =>
            [
              step.replace('inverse-', ''),
              tokens[step as keyof typeof tokens],
            ] as [string, SwatchData]
        );
      return (
        <SwatchList
          key={`${inverse}-${prefix}`}
          label={inverse ? `Inverse: ${label.toLowerCase()}` : label}
          swatches={swatches}
          format={format}
          onCopy={onCopy}
        />
      );
    });

  return (
    <Details
      summary={
        group.aliasOf ? `${group.name} (volgt ${group.aliasOf})` : group.name
      }
    >
      <Stack space="xl">
        <FormField
          label="Basiskleur"
          htmlFor={id}
          description={
            group.aliasOf
              ? `Volgt ${group.aliasOf}. Kies je een eigen kleur, dan volgt deze groep niet meer.`
              : 'Elke CSS-kleur, bijvoorbeeld #0057b0 of oklch(0.47 0.16 256).'
          }
          error={
            colorInvalid
              ? 'Dit is geen kleur. Gebruik bijvoorbeeld #0057b0 of oklch(0.47 0.16 256).'
              : undefined
          }
        >
          <ColorInput
            id={id}
            value={colorDraft}
            pickerValue={pickerValue(group.baseColor)}
            pickerLabel={`Kleurkiezer voor ${group.name}`}
            invalid={colorInvalid}
            onChange={handleColor}
          />
        </FormField>

        {!group.standard && (
          <Stack space="md">
            <FormField
              label="Naam"
              htmlFor={`${id}-name`}
              description="Kleine letters, cijfers en streepjes. Wordt de tokennaam: dsn.color.{naam}."
              error={nameError ?? undefined}
            >
              <TextInput
                id={`${id}-name`}
                value={nameDraft}
                invalid={!!nameError}
                inlineSize="md"
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleRename();
                }}
              />
            </FormField>
            <div className="tc-actions">
              <Button
                variant="default"
                size="small"
                iconStart={<Icon name="pencil" />}
                onClick={handleRename}
              >
                Naam wijzigen
              </Button>
              <Button
                variant="subtle-negative"
                size="small"
                iconStart={<Icon name="trash" />}
                onClick={() => onDelete(group.name)}
              >
                Groep verwijderen
              </Button>
            </div>
          </Stack>
        )}

        {tracks(false)}
        {showInverse && tracks(true)}
      </Stack>
    </Details>
  );
}
