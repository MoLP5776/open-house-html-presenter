import { Category } from './blocks';
import { esc } from './text-utils';

/* Tiny, line based syntax highlighting. Output is escaped HTML with t-* spans. */

const span = (c: string, s: string) => `<span class="t-${c}">${esc(s)}</span>`;

function tok(src: string, re: RegExp, fn: (m: RegExpExecArray) => string): string {
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(src))) {
    if (m[0] === '') {
      re.lastIndex++;
      continue;
    }
    out += esc(src.slice(last, m.index)) + fn(m);
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}

const RE_HTML = /(<![-][-].*?[-][-]>)|(<\/?)([\w!]+)|([\w-]+)(=)("[^"]*")|(\/?>)/g;
const RE_CSS_DECL = /(\/\*.*?\*\/)|([a-z-]+)(\s*:\s*)([^;{}]+)|([{};])/g;
const RE_JS =
  /(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|if|else|return|for|while|new|true|false|null|document|window|Math)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\()/g;

export function highlight(line: string, lg: Category): string {
  if (lg === 'html') {
    return tok(line, RE_HTML, (m) =>
      m[1]
        ? span('com', m[1])
        : m[2]
          ? span('punc', m[2]) + span('tag', m[3])
          : m[4]
            ? span('attr', m[4]) + span('punc', m[5]) + span('str', m[6])
            : span('punc', m[7]),
    );
  }
  if (lg === 'css') {
    let out = '';
    let rest = line;
    const bi = rest.indexOf('{');
    if (bi !== -1) {
      const sel = rest.slice(0, bi);
      out += sel.trim().startsWith('@') ? tok(sel, /@[\w-]+/g, (m) => span('kw', m[0])) : span('sel', sel);
      out += span('punc', '{');
      rest = rest.slice(bi + 1);
    }
    return (
      out +
      tok(rest, RE_CSS_DECL, (m) =>
        m[1] ? span('com', m[1]) : m[2] ? span('prop', m[2]) + esc(m[3]) + span('val', m[4]) : span('punc', m[5]),
      )
    );
  }
  return tok(line, RE_JS, (m) =>
    m[1]
      ? span('com', m[1])
      : m[2]
        ? span('str', m[2])
        : m[3]
          ? span('kw', m[3])
          : m[4]
            ? span('num', m[4])
            : span('fn', m[5]),
  );
}
