/**
 * Type-stub voor de CSS- en SCSS-exports van dit package.
 *
 * Een side-effect import zoals `import '@dsn-starter-kit/core/css'` moet voor
 * TypeScript naar een module oplossen. Zonder deze stub faalt dat met TS2882
 * ("Cannot find module or type declarations for side-effect import") zodra de
 * consument `noUncheckedSideEffectImports` aanzet, en tonen editors een fout
 * ook als `tsc` zwijgt.
 *
 * Elke CSS- en SCSS-entry in de `exports`-map van de package.json wijst met
 * haar `types`-conditie naar dit bestand. Eén stub per package is genoeg; hij
 * blijft bewust binnen het package, zodat het gepubliceerde artifact nooit naar
 * een bestand buiten zijn eigen map wijst.
 *
 * Leeg met opzet: deze imports leveren geen waarde op, alleen stijl.
 */
export {};
