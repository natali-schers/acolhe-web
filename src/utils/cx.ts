/** Junta classes CSS ignorando valores falsos: cx("a", cond && "b") */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
