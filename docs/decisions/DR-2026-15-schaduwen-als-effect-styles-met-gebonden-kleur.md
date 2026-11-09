# DR-2026-15: Schaduwen worden effect styles met een kleur-variable

**ID:** DR-2026-15
**Datum:** November 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Figma-variables kennen vier types: COLOR, FLOAT, STRING en BOOLEAN. Een `box-shadow` past daar niet in, dus de variables-build sloeg de schaduwtokens over, en de componentgenerator liet elke schaduw weg met een waarschuwing. Drawer, ModalDialog en Popover kwamen zonder elevatie in Figma. De dikkere rand die een tekstveld bij hover, focus en invalid krijgt (`inset 0 0 0 var(--spread) var(--color)`) ontbrak ook, in zo'n 240 varianten over acht sets.

In Figma hoort een schaduw een **effect style** te zijn. Twee eigenschappen maken dat lastig:

- **Een effect style heeft geen modes.** De schaduwen verschillen per theme en light/dark: in `start-dark` is de directe laag vijf keer zo donker (alpha 0,6 tegenover 0,12), en Wireframe heeft helemaal geen schaduw.
- **De schaduwkleuren waren `color-mix()`** (`color-mix(in srgb, black 12%, transparent)`), en de build kon die niet naar een kleur omrekenen. Ze vielen dus ook als variable af.

De Plugin API laat de velden van een effect wél aan een variable binden (`setBoundVariableForEffect`): kleur, offset, blur en spread. Dat geldt ook voor de effects in een style.

---

## Opties overwogen

### Optie 1: Een effect style per theme × mode

`start-light/box-shadow/md`, `start-dark/box-shadow/md`, enzovoort.

**Voordeel:** Elke style is letterlijk de CSS van zijn mode.
**Nadeel:** Een designer moet bij elke wissel van theme of light/dark de style op elke laag zelf omzetten. Een component volgt de schakelaar dan niet, en dat is het probleem dat de variables juist oplossen.

### Optie 2: Eén style per schaduw, met de kleur aan een variable (gekozen)

`box-shadow/md` heeft drie lagen met vaste offset, blur en spread. De kleur van elke laag hangt aan `dsn/Primitives → color/shadow/direct`, `…/ambient` of `…/highlight`, en die volgen de theme- en light/dark-schakelaar.

**Voordeel:** Eén style per elevatie, die met de modes meeschakelt.
**Nadeel:** Alleen de kleur kan per mode verschillen. Een theme dat ook een andere offset of blur wil, past er niet in zonder een FLOAT-variable per veld.

### Optie 3: Geen styles, alleen effects op de lagen

**Voordeel:** Geen nieuw soort Figma-object.
**Nadeel:** Een designer kan de schaduw van een Card of Modal niet op een eigen laag zetten, en een wijziging komt niet bij de lagen die er al mee getekend zijn.

---

## Beslissing

**De schaduwprimitieven (`dsn.box-shadow.sm`, `.md`, `.lg`) worden effect styles, met de kleur van elke laag gebonden aan de Primitives-variable waar het token naar verwijst.**

Vier regels die hieruit volgen:

1. **`color-mix(in srgb, …)` wordt uitgerekend**, met voorvermenigvuldigde alpha zoals CSS dat doet. Daardoor bestaan `color/shadow/direct`, `ambient` en `highlight` nu als variable. Alleen `in srgb`; een andere interpolatieruimte levert geen kleur op en komt in het report.
2. **Wireframe krijgt transparante schaduwkleuren.** Daar zijn de schaduwen `none`, maar dezelfde style moet er iets tekenen. Met transparante kleuren tekenen dezelfde drie lagen niets. De build controleert dit: een mode waarin de schaduw `none` is maar een gebonden kleur niet transparant is, levert geen style op. Hetzelfde geldt voor een offset, blur of spread die per mode verschilt. Een style die niet in elke mode de CSS reproduceert wordt niet gemaakt; dezelfde asymmetrie als bij de variable-bindingen ([DR-2026-06](DR-2026-06-figma-bindingen-meten-plus-cssom.md)).
3. **Alleen primitieven worden een style, geen component-tokens.** Een effect style kan in Figma niet naar een andere style verwijzen. Een eigen style per `drawer/box-shadow` zou dus een kopie zijn die niet meeverandert. De generator volgt de `var()`-keten van een component tot aan de primitief: Drawer en ModalDialog krijgen `box-shadow/lg`, Popover `box-shadow/md`.
4. **Een schaduw zonder style wordt effects op de laag**, met een variable-binding op elk veld dat uit één token komt. De rand van een tekstveld bindt zo zijn spread en kleur aan `text-input/invalid/box-shadow-*`. De focusring van SkipLink houdt een vaste spread, want die is een `calc()` van twee tokens. Bij een `inset`-schaduw ligt de schaduw in CSS binnen de border, terwijl Figma de stroke over de inner shadow heen tekent: de rand van een tekstveld oogt in Figma 2px in plaats van 3px. Die 1px verschil is geaccepteerd. Een vaste spread (randdikte plus token) kwam in Figma niet aan, en de binding aan het token houdt de spread gelijk aan de code.

---

## Consequenties

- Een import van `variables.json` maakt drie effect styles aan, of werkt ze bij op naam. Het id blijft gelijk, dus een laag die een designer al aan een style hing, blijft eraan hangen.
- De componentimport hangt de lagen pas aan het eind aan hun style: `setEffectStyleIdAsync` is asynchroon onder `documentAccess: dynamic-page`. Tot dan staan de gemeten effects erop. Ontbreekt de style in het bestand, dan blijven die staan en meldt de plugin het.
- Figma tekent de spread van een schaduw op een frame alleen met `clip content`. Een frame met spread clipt daarom, als er niets buiten valt; zo niet, dan meldt de build het.
- Een theme met een andere schaduwvorm (andere offset, meer lagen) vraagt een herziening: FLOAT-variables per veld, of toch een style per theme.

---

## Gerelateerd

- Issue [#326](https://github.com/jeffreylauwers/design-system-starter-kit/issues/326)
- [DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md): genereren uit code via een eigen plugin
- [DR-2026-06](DR-2026-06-figma-bindingen-meten-plus-cssom.md): waarde gemeten, tokennaam uit de CSSOM
