import { BASE_CSS, Block, BLOCKS, Category } from './blocks';
import { Lang, STR } from './i18n';
import { esc } from './text-utils';

export interface CodeLine {
  text: string;
  lg: Category;
  /** Id of the block that produced this line, or null for boilerplate. */
  bid: number | null;
}

export interface CodeParts {
  html: string;
  css: string;
  js: string;
}

export interface Generated {
  lines: CodeLine[];
  doc: string;
  parts: CodeParts;
}

interface Part {
  text: string;
  bid: number;
}

export function generate(blocks: Block[], lang: Lang): Generated {
  const parts: Record<Category, Part[]> = { html: [], css: [], js: [] };
  for (const b of blocks) {
    const def = BLOCKS[b.type];
    if (!def) continue;
    let out = {};
    try {
      out = def.gen(b.values, b.id, lang) || {};
    } catch {
      out = {};
    }
    (['html', 'css', 'js'] as const).forEach((k) => {
      const text = (out as Partial<Record<Category, string>>)[k];
      if (text) parts[k].push({ text, bid: b.id });
    });
  }

  const lines: CodeLine[] = [];
  const push = (text: string, lg: Category, bid: number | null = null, ind = '') => {
    text.split('\n').forEach((l) => lines.push({ text: l ? ind + l : '', lg, bid }));
  };
  push('<!DOCTYPE html>', 'html');
  push(`<html lang="${lang}">`, 'html');
  push('<head>', 'html');
  push('  <meta charset="UTF-8">', 'html');
  push(`  <title>${esc(STR[lang].pageTitle)}</title>`, 'html');
  push('  <style>', 'html');
  push(BASE_CSS, 'css', null, '    ');
  parts.css.forEach((p) => {
    push('', 'css');
    push(p.text, 'css', p.bid, '    ');
  });
  push('  </style>', 'html');
  push('</head>', 'html');
  push('<body>', 'html');
  parts.html.forEach((p) => push(p.text, 'html', p.bid, '  '));
  if (parts.js.length) {
    push('', 'html');
    push('  <script>', 'html');
    parts.js.forEach((p, i) => {
      if (i) push('', 'js');
      push(p.text, 'js', p.bid, '    ');
    });
    push('  <\/script>', 'html');
  }
  push('</body>', 'html');
  push('</html>', 'html');

  return {
    lines,
    doc: lines.map((l) => l.text).join('\n'),
    parts: {
      html: parts.html.map((p) => p.text).join('\n'),
      css: [BASE_CSS].concat(parts.css.map((p) => p.text)).join('\n\n'),
      js: parts.js.map((p) => p.text).join('\n\n'),
    },
  };
}

/** Builds a full HTML document from hand-written HTML, CSS and JS. */
export function buildDoc(code: CodeParts, lang: Lang): string {
  const ind = (s: string, p: string) =>
    s
      .split('\n')
      .map((l) => (l ? p + l : l))
      .join('\n');
  return `<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n  <meta charset="UTF-8">\n  <title>${esc(STR[lang].pageTitle)}</title>\n  <style>\n${ind(code.css, '    ')}\n  </style>\n</head>\n<body>\n${ind(code.html, '  ')}\n  <script>\n${ind(code.js, '    ')}\n  <\/script>\n</body>\n</html>`;
}

/** Message the preview hook posts to the parent window. */
export interface PreviewMessage {
  __pg: true;
  type: 'log' | 'error';
  msg: string;
}

/* Hook injected into the preview so console.log and errors reach the app */
const HOOK =
  '<script>(function(){' +
  'function send(type,args){try{parent.postMessage({__pg:true,type:type,msg:Array.prototype.map.call(args,function(a){try{return (a&&typeof a==="object")?JSON.stringify(a):String(a);}catch(e){return String(a);}}).join(" ")},"*");}catch(e){}}' +
  'var log=console.log;console.log=function(){send("log",arguments);log.apply(console,arguments);};' +
  'window.addEventListener("error",function(e){send("error",[e.message]);});' +
  '})();<\/script>';

export const injectHook = (doc: string): string => doc.replace('<head>', '<head>\n' + HOOK);
