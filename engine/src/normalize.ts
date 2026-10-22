/**
 * Text normalisation with an index map back to the original string.
 *
 * The rules run over a normalised copy of the input: lowercase, Unicode NFKC,
 * zero-width and bidi control characters removed, Latin diacritics stripped,
 * Cyrillic/Greek look-alike letters folded to Latin, Indic digits converted to
 * ASCII, Devanagari nukta removed and chandrabindu folded to anusvara, quotes
 * and dashes unified, whitespace collapsed. Every character of the normalised
 * text remembers which slice of the original it came from, so evidence spans
 * can be reported in the user's own text.
 */

export interface Normalized {
  /** The normalised text. */
  text: string;
  /** For each UTF-16 index of `text`, the start index in the original string. */
  start: number[];
  /** For each UTF-16 index of `text`, the end index (exclusive) in the original string. */
  end: number[];
  /** A word mixes Latin letters with Cyrillic/Greek look-alikes (a filter-evasion trick). */
  mixedScript: boolean;
  /** The input contained right-to-left override characters (used to fake file extensions). */
  bidiOverride: boolean;
}

/** Characters that are removed entirely (zero-width, joiners, bidi controls, fillers). */
function isInvisible(cp: number): boolean {
  return (
    (cp >= 0x200b && cp <= 0x200f) ||
    (cp >= 0x202a && cp <= 0x202e) ||
    (cp >= 0x2060 && cp <= 0x2064) ||
    (cp >= 0x2066 && cp <= 0x2069) ||
    cp === 0xfeff ||
    cp === 0x00ad ||
    cp === 0x034f ||
    cp === 0x180e ||
    cp === 0x061c ||
    cp === 0x115f ||
    cp === 0x1160 ||
    cp === 0x3164 ||
    cp === 0xffa0 ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0xe0000 && cp <= 0xe007f)
  );
}

function isSpace(cp: number): boolean {
  return (
    cp === 0x20 ||
    (cp >= 0x09 && cp <= 0x0d) ||
    cp === 0xa0 ||
    cp === 0x1680 ||
    (cp >= 0x2000 && cp <= 0x200a) ||
    cp === 0x2028 ||
    cp === 0x2029 ||
    cp === 0x202f ||
    cp === 0x205f ||
    cp === 0x3000
  );
}

/** Upper-case Cyrillic/Greek letters that look like Latin letters (mapped before lowercasing). */
const UPPER_FOLD: Record<string, string> = {
  'А': 'a', 'В': 'b', 'Е': 'e', 'К': 'k', 'М': 'm', 'Н': 'h', 'О': 'o', 'Р': 'p', 'С': 'c',
  'Т': 't', 'У': 'y', 'Х': 'x', 'Ѕ': 's', 'І': 'i', 'Ј': 'j', 'Ү': 'y', 'Ԛ': 'q', 'Ԝ': 'w',
  'Α': 'a', 'Β': 'b', 'Ε': 'e', 'Ζ': 'z', 'Η': 'h', 'Ι': 'i', 'Κ': 'k', 'Μ': 'm', 'Ν': 'n',
  'Ο': 'o', 'Ρ': 'p', 'Τ': 't', 'Υ': 'y', 'Χ': 'x',
};

/** Lower-case Cyrillic/Greek (and a few IPA) letters that look like Latin letters. */
const LOWER_FOLD: Record<string, string> = {
  'а': 'a', 'в': 'b', 'е': 'e', 'ё': 'e', 'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p',
  'с': 'c', 'т': 't', 'у': 'y', 'х': 'x', 'ѕ': 's', 'і': 'i', 'ї': 'i', 'ј': 'j', 'ԁ': 'd',
  'ӏ': 'l', 'ԛ': 'q', 'ԝ': 'w', 'һ': 'h', 'ү': 'y', 'ѵ': 'v', 'ɡ': 'g', 'ɑ': 'a', 'ı': 'i',
  'α': 'a', 'β': 'b', 'ε': 'e', 'η': 'n', 'ι': 'i', 'κ': 'k', 'ν': 'v', 'ο': 'o', 'ρ': 'p',
  'τ': 't', 'υ': 'u', 'χ': 'x', 'γ': 'y', 'ω': 'w', 'μ': 'u', 'ϲ': 'c',
};

/** Devanagari letters with a precomposed nukta, mapped to the plain letter. */
const NUKTA_LETTERS: Record<number, number> = {
  0x0958: 0x0915, 0x0959: 0x0916, 0x095a: 0x0917, 0x095b: 0x091c, 0x095c: 0x0921,
  0x095d: 0x0922, 0x095e: 0x092b, 0x095f: 0x092f, 0x0929: 0x0928, 0x0931: 0x0930, 0x0934: 0x0933,
};

/** Zero digit of each Indic / Arabic-Indic digit block. */
const DIGIT_ZEROS = [0x0660, 0x06f0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6, 0x0d66, 0x0de6, 0x0e50, 0x1040];

function indicDigit(cp: number): number {
  for (let i = 0; i < DIGIT_ZEROS.length; i++) {
    const z = DIGIT_ZEROS[i] as number;
    if (cp >= z && cp <= z + 9) return cp - z;
  }
  return -1;
}

function isLatinLetter(ch: string): boolean {
  return ch >= 'a' && ch <= 'z';
}

const LATIN_WITH_MARKS = /[À-ɏḀ-ỿ]/;

/** Map one code point to its normalised form (may be '' or several characters). */
function mapCodePoint(cp: number, flags: { folded: boolean }): string {
  flags.folded = false;
  if (cp < 0x80) {
    if (cp >= 65 && cp <= 90) return String.fromCharCode(cp + 32);
    return String.fromCharCode(cp);
  }
  // Devanagari block: handle without NFKC (fast and predictable).
  if (cp >= 0x0900 && cp <= 0x097f) {
    if (cp === 0x093c) return ''; // nukta
    if (cp === 0x0901) return 'ं'; // chandrabindu -> anusvara
    if (cp === 0x0964 || cp === 0x0965) return '.'; // danda
    const plain = NUKTA_LETTERS[cp];
    if (plain !== undefined) return String.fromCharCode(plain);
    const d = indicDigit(cp);
    if (d >= 0) return String.fromCharCode(48 + d);
    return String.fromCharCode(cp);
  }
  const d = indicDigit(cp);
  if (d >= 0) return String.fromCharCode(48 + d);
  // Quotes, dashes and full stops used to dodge filters.
  switch (cp) {
    case 0x2018: case 0x2019: case 0x201a: case 0x201b: case 0x2032: case 0x00b4: case 0x02bc:
      return "'";
    case 0x201c: case 0x201d: case 0x201e: case 0x2033: case 0x00ab: case 0x00bb:
      return '"';
    case 0x2010: case 0x2011: case 0x2012: case 0x2013: case 0x2014: case 0x2015: case 0x2212:
      return '-';
    case 0x3002: case 0xff61:
      return '.';
    default:
      break;
  }
  let s = String.fromCodePoint(cp);
  const up = UPPER_FOLD[s];
  if (up !== undefined) {
    flags.folded = true;
    return up;
  }
  s = s.normalize('NFKC');
  // Latin letters with diacritics: strip the marks.
  if (LATIN_WITH_MARKS.test(s)) s = s.normalize('NFD');
  s = s.toLowerCase();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0x0300 && c <= 0x036f) continue; // combining diacritics
    const ch = s.charAt(i);
    const low = LOWER_FOLD[ch];
    if (low !== undefined) {
      flags.folded = true;
      out += low;
      continue;
    }
    const dd = indicDigit(c);
    out += dd >= 0 ? String.fromCharCode(48 + dd) : ch;
  }
  return out;
}

/**
 * Normalise text for matching. See module docs for the exact steps.
 * Runs in a single pass and is safe for any input length.
 */
export function normalize(input: string): Normalized {
  let text = '';
  const start: number[] = [];
  const end: number[] = [];
  let mixedScript = false;
  let bidiOverride = false;
  let lastSpace = true; // suppresses leading whitespace
  let wordLatin = false;
  let wordFolded = false;
  const flags = { folded: false };

  const endWord = (): void => {
    if (wordLatin && wordFolded) mixedScript = true;
    wordLatin = false;
    wordFolded = false;
  };

  for (let i = 0; i < input.length; ) {
    const cp = input.codePointAt(i) as number;
    const len = cp > 0xffff ? 2 : 1;
    const s0 = i;
    i += len;
    if (isInvisible(cp)) {
      if (cp === 0x202e || cp === 0x202d || cp === 0x2066 || cp === 0x2067 || cp === 0x2068) bidiOverride = true;
      continue;
    }
    if (isSpace(cp)) {
      endWord();
      if (!lastSpace) {
        text += ' ';
        start.push(s0);
        end.push(i);
        lastSpace = true;
      }
      continue;
    }
    const mapped = mapCodePoint(cp, flags);
    if (mapped === '') continue;
    for (let k = 0; k < mapped.length; k++) {
      const ch = mapped.charAt(k);
      if (ch === ' ') {
        if (lastSpace) continue;
        lastSpace = true;
        endWord();
      } else {
        lastSpace = false;
        if (isLatinLetter(ch)) {
          if (flags.folded) wordFolded = true;
          else wordLatin = true;
        } else if (!(ch >= '0' && ch <= '9')) {
          endWord();
        }
      }
      text += ch;
      start.push(s0);
      end.push(i);
    }
  }
  endWord();
  // Trim a trailing space.
  if (text.length > 0 && text.charCodeAt(text.length - 1) === 32) {
    text = text.slice(0, -1);
    start.pop();
    end.pop();
  }
  return { text, start, end, mixedScript, bidiOverride };
}

/** Map a [s, e) range of normalised text back to the original string. */
export function toOriginal(n: Normalized, s: number, e: number): { start: number; end: number } {
  if (n.text.length === 0) return { start: 0, end: 0 };
  const si = Math.max(0, Math.min(s, n.text.length - 1));
  const ei = Math.max(si, Math.min(e - 1, n.text.length - 1));
  return { start: n.start[si] as number, end: n.end[ei] as number };
}

/** Lightweight clean-up for identifiers: NFKC, strip invisibles, trim. Keeps case. */
export function cleanIdentifier(raw: string): string {
  let out = '';
  for (let i = 0; i < raw.length; ) {
    const cp = raw.codePointAt(i) as number;
    i += cp > 0xffff ? 2 : 1;
    if (isInvisible(cp)) continue;
    out += String.fromCodePoint(cp);
  }
  out = out.normalize('NFKC').replace(/[。｡]/g, '.');
  return out.trim();
}

/** True for characters that count as part of a word (ASCII alnum, Latin, Devanagari and other Indic letters). */
export function isWordCode(c: number): boolean {
  if (c < 0x80) return (c >= 48 && c <= 57) || (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 95;
  if (c >= 0x0900 && c <= 0x097f) return c !== 0x0964 && c !== 0x0965 && c !== 0x0970;
  if (c >= 0xc0 && c <= 0x24f) return c !== 0xd7 && c !== 0xf7;
  if (c >= 0x0980 && c <= 0x0dff) return true; // other Indic scripts
  if (c >= 0x0370 && c <= 0x04ff) return true; // Greek, Cyrillic
  return false;
}
