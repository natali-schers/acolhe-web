import { colors } from "./colors";
import { fonts, radius, shadows } from "./tokens";

const toKebab = (value: string) => value.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * Publica as cores e tokens como variáveis CSS no <html>.
 * Ex.: colors.primarySoft -> --color-primary-soft
 */
export function applyTheme(root: HTMLElement = document.documentElement) {
  Object.entries(colors).forEach(([key, value]) => root.style.setProperty(`--color-${toKebab(key)}`, value));
  Object.entries(radius).forEach(([key, value]) => root.style.setProperty(`--radius-${toKebab(key)}`, value));
  Object.entries(shadows).forEach(([key, value]) => root.style.setProperty(`--shadow-${toKebab(key)}`, value));
  Object.entries(fonts).forEach(([key, value]) => root.style.setProperty(`--font-${toKebab(key)}`, value));
}
