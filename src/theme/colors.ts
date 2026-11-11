/**
 * Paleta de cores do Acolhe.
 *
 * Este é o ÚNICO lugar onde as cores do projeto são definidas.
 * Elas viram variáveis CSS (ex.: `colors.primary` -> `var(--color-primary)`)
 * em `applyTheme.ts`, e os arquivos `.module.css` usam essas variáveis.
 *
 * Para mudar uma cor no projeto inteiro, mude aqui.
 */
export const palette = {
  teal900: "#0c4e4e",
  teal800: "#094747",
  teal700: "#0f5c5c",
  teal200: "#d4e8e5",
  teal100: "#e6f1ef",

  red700: "#b3261e",
  red200: "#f3d0cd",
  red100: "#fbe9e7",

  green700: "#1b6b3a",
  green300: "#a9cfb5",
  green100: "#e6f3ea",

  amber700: "#8a5a00",
  amber300: "#e5c87f",
  amber100: "#fff3d6",

  blue700: "#315c88",
  blue100: "#e9f0fa",

  yellow500: "#f2a900",

  neutral0: "#ffffff",
  neutral50: "#faf8f5",
  neutral100: "#f6f5f2",
  neutral150: "#f2f1ee",
  neutral200: "#eeece8",
  neutral300: "#dedbd5",
  neutral400: "#c9c8c3",
  neutral500: "#848785",
  neutral600: "#666b69",
  neutral900: "#1a1a1a",
} as const;

/** Cores com significado (use estas nos componentes, não a `palette`). */
export const colors = {
  // Marca
  primary: palette.teal700,
  primaryDark: palette.teal800,
  primarySoft: palette.teal100,
  primaryMuted: palette.teal200,
  sidebar: palette.teal900,

  // Estados
  danger: palette.red700,
  dangerSoft: palette.red100,
  dangerBorder: palette.red200,
  success: palette.green700,
  successSoft: palette.green100,
  successBorder: palette.green300,
  warning: palette.amber700,
  warningSoft: palette.amber100,
  warningBorder: palette.amber300,
  info: palette.blue700,
  infoSoft: palette.blue100,
  focus: palette.yellow500,

  // Superfícies e texto
  background: palette.neutral50,
  backgroundAlt: palette.neutral100,
  surface: palette.neutral0,
  surfaceMuted: palette.neutral150,
  border: palette.neutral300,
  borderSoft: palette.neutral200,
  borderStrong: palette.neutral400,
  text: palette.neutral900,
  textMuted: palette.neutral600,
  textSubtle: palette.neutral500,
  textOnPrimary: palette.neutral0,
} as const;

export type ColorToken = keyof typeof colors;
