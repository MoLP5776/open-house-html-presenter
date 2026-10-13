/** Escapes a value for use inside HTML text or a double-quoted attribute. */
export const esc = (s: unknown): string =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Turns a value into a single-quoted JavaScript string literal. */
export const jsStr = (s: unknown): string =>
  "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
