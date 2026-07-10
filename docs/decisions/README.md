# Decision Records

Architectuurkeuzes voor het Design System Starter Kit.

Een decision record documenteert **waarom** iets is zoals het is — niet alleen wat er is beslist, maar welke alternatieven zijn overwogen en welke trade-offs bewust zijn gemaakt. Lees deze records als je je afvraagt: "waarom doen we het zo?"

## Index

| ID                                                                | Besluit                                                              | Status   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| [DR-2026-01](DR-2026-01-button-label-span-over-aria-label.md)     | `dsn-button__label` span in plaats van `aria-label` op buttons       | Accepted |
| [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md) | HTML/CSS als bron van waarheid, React als wrapper                    | Accepted |
| [DR-2026-03](DR-2026-03-breakpoints-als-reference-only-tokens.md) | Breakpoints als reference-only tokens, hardcoded in CSS @media rules | Accepted |
| [DR-2026-04](DR-2026-04-htmltemplate-spiegelt-echte-render.md)    | Storybook `htmlTemplate` spiegelt de echte render en volgt de args   | Accepted |

## Een nieuw record toevoegen

Gebruik de `/decision-record` skill in Claude Code, of kopieer de structuur van een bestaand record.

Bestandsnaamconventie: `DR-{JAAR}-{VOLGNUMMER}-{korte-beschrijving}.md`

Wanneer een record aanmaken? Als je je afvraagt: "Als ik dit over 12 maanden teruglees, snap ik dan nog waarom we dit zo hebben gedaan?" — zo niet, schrijf het op.
