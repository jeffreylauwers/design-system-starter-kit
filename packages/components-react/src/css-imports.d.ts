// Elk component importeert zijn eigen CSS als side-effect (`import './Button.css'`).
// Sinds TypeScript 6 staat `noUncheckedSideEffectImports` standaard aan, en
// dan moet zo'n import een declaratie hebben.
declare module '*.css';
