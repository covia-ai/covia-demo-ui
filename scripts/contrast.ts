/**
 * Token contrast utilities — OKLCH → sRGB → WCAG relative luminance/contrast,
 * plus a tokens.css parser that resolves `var()` aliases per theme. Used by
 * `contrast.test.ts` to enforce AA on every semantic pair in both themes.
 * No external dependencies (offline-safe); the OKLab matrices are the standard
 * Björn Ottosson coefficients.
 */

export type Rgb = { r: number; g: number; b: number }; // linear, 0..1

/** oklch(L C H) → linear sRGB (clamped to gamut for luminance purposes). */
export function oklchToLinearRgb(L: number, C: number, Hdeg: number): Rgb {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return {
    r: clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** WCAG relative luminance from linear sRGB. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two oklch triples. */
export function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const lf = luminance(oklchToLinearRgb(...fg));
  const lb = luminance(oklchToLinearRgb(...bg));
  const hi = Math.max(lf, lb);
  const lo = Math.min(lf, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export type ThemeTokens = Record<string, [number, number, number]>;

const OKLCH_RE = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/;
const VAR_RE = /var\(\s*(--[\w-]+)\s*\)/;

/** Extract the body of the first CSS block whose selector matches `selector`. */
function blockBody(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

/** Parse `--name: value;` declarations from a block body into a raw map. */
function rawDecls(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of body.split(';')) {
    const m = line.match(/(--[\w-]+)\s*:\s*(.+)/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

/** Resolve a raw map to oklch triples, following `var()` aliases; skips non-colour tokens. */
function resolve(raw: Record<string, string>): ThemeTokens {
  const out: ThemeTokens = {};
  const seen = new Set<string>();
  const get = (name: string): [number, number, number] | null => {
    let val = raw[name];
    let guard = 0;
    while (val && VAR_RE.test(val) && guard++ < 10) {
      val = raw[val.match(VAR_RE)![1]];
    }
    if (!val) return null;
    const m = val.match(OKLCH_RE);
    return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : null;
  };
  for (const name of Object.keys(raw)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const triple = get(name);
    if (triple) out[name] = triple;
  }
  return out;
}

/** Parse tokens.css into resolved light and dark token maps. */
export function parseThemes(css: string): { light: ThemeTokens; dark: ThemeTokens } {
  const light = resolve(rawDecls(blockBody(css, ':root {')));
  const darkRaw = { ...rawDecls(blockBody(css, ':root {')), ...rawDecls(blockBody(css, ":root[data-theme='dark'] {")) };
  return { light, dark: resolve(darkRaw) };
}
