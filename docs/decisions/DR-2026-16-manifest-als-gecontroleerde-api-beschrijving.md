# DR-2026-16: De manifest wordt een gecontroleerde API-beschrijving, geen component contract

**ID:** DR-2026-16
**Datum:** November 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

De API van een component staat op meerdere plekken die niets met elkaar vergelijkt. Bij Button: de `ButtonVariant`-union in `Button.tsx`, de `primaryProps` in `manifest.json` (in een andere volgorde en zonder slots of states), de assen en component properties in de Figma-matrix (met de hand overgetypt, met een commentaar dat de volgorde "de union volgt"), en de `.docs.md`. Dat `loading` en `fullWidth` bewust niet in Figma staan (#323), stond alleen in een code-commentaar.

In de designsystemen-wereld wordt hiervoor steeds vaker een **component contract** voorgesteld: één platformonafhankelijke definitie per component (props, slots, states, anatomie, tokenbindingen, toegankelijkheid), waaruit zowel de code als de Figma-component wordt gegenereerd en waartegen beide worden gecontroleerd. De meest uitgewerkte versie is southleft/ds-contracts-poc. De vraag was of dat iets voor ons is.

---

## Opties overwogen

### Optie 1: Contract-first

Een contract per component is de bron. React en Figma worden eruit gegenereerd; een three-way differ controleert of ze nog overeenkomen.

**Voordeel:** Eén bron, en een expliciete plek voor alles wat een component is.
**Nadeel:** Botst met [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md) (HTML/CSS is de bron van waarheid) en [DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md) (code is de bron, Figma wordt gemeten uit de echte render). Een contract beschrijft anatomie en tokenbindingen als data, naast de CSS: een tweede beschrijving van de layout die uit de pas kan lopen. De spec is bovendien jong (zeventien schemaversies in enkele maanden, v1 niet af) en ondersteunt alleen React.

### Optie 2: Niets veranderen

**Voordeel:** Geen werk.
**Nadeel:** De drift blijft onzichtbaar tot iemand hem toevallig ziet.

### Optie 3: De manifest uitbreiden en controleren (gekozen)

De bestaande manifest beschrijft de volledige API: alle props, slots en states, en per onderdeel hoe het in Figma terugkomt. De manifest genereert niets. Tests vergelijken hem met de React-types en met de Figma-matrix.

**Voordeel:** De controle van een contract, zonder dat de bron van waarheid verschuift. Klein te beginnen (één component), en bruikbaar als context voor AI-tools.
**Nadeel:** Er komt een vierde plek bij die de API noemt. Dat is alleen acceptabel omdat die plek gecontroleerd wordt; zonder de tests zou dit de drift erger maken.

---

## Beslissing

**De manifest wordt de gecontroleerde beschrijving van de API van een component. Geen contract-first: HTML/CSS blijft de bron voor gedrag en uiterlijk, de manifest beschrijft wat een component is en wordt daartegen getest.**

Deelbesluiten:

**Eén manifest-bestand per component**, naast de CSS: `components-html/src/{component}/{component}.manifest.json`. Wie aan een component werkt, ziet het staan, en een PR raakt alleen het bestand van dat component. `scripts/build-manifest.js` voegt de bestanden samen tot `manifest.json`.

**`manifest.json` blijft ingecheckt, maar is gegenereerd.** Consumers, figma-sync en de tests lezen hem zonder build. In CI controleert de build alleen, en faalt hij als het bestand achterloopt; lokaal schrijft de build het opnieuw.

**Een optioneel `api`-blok** met `props`, `slots` en `states`. Elk onderdeel heeft een Figma-binding: `variant` (een as), `boolean`, `text`, `instance-swap` (een component property), of `none` met een reden. Optioneel, zodat de 73 andere componenten één voor één kunnen volgen. `primaryProps` blijft als samenvatting en mag `api.props` niet tegenspreken.

**Controleren, niet genereren.** `tests/manifest-react.test.ts` leest het props-interface met de TypeScript-parser (namen, union-waarden in volgorde, optioneel, defaults). `tests/manifest-figma.test.ts` vergelijkt de bindingen met de assen en component properties van de matrix. De enige plek waar de manifest wél iets voedt, is de waardenlijst van een prop-as in een matrix (`axisValues`): daar is overtypen de bron van drift en levert lezen niets in.

**Buiten scope:** anatomie, tokenbindingen per onderdeel en gedrag (events, focusbeheer). Anatomie en tokens meet figma-sync al uit de echte render; dat in data herhalen voegt een tweede waarheid toe.

---

## Impact

| Wat                        | Waar                                                       |
| -------------------------- | ---------------------------------------------------------- |
| Manifest per component     | `components-html/src/*/*.manifest.json` (74 bestanden)     |
| Samenvoegen en valideren   | `components-html/scripts/build-manifest.js`                |
| Regels buiten het schema   | `components-html/scripts/validate-manifest.js`, `checkApi` |
| Manifest versus React      | `tests/manifest-react.test.ts`                             |
| Manifest versus Figma      | `tests/manifest-figma.test.ts`                             |
| Assen uit de manifest      | `figma-sync/src/manifest.js`, `axisValues`                 |
| Eerste component met `api` | Button                                                     |

De Figma-output van Button is ongewijzigd. Vervolg: de overige componenten krijgen een `api`-blok (issue #484 noemt de open vragen, waaronder web components).
