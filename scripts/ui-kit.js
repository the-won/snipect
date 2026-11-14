/* ================================================================
   ui-kit.js — 가이드와 토큰을 읽어 VSCode 추천 환경을 만든다
   - gen   : guide/*.html 의 @snippet 구간 → .vscode 스니펫 파일
             token.css + 스니펫 목록 → docs/ui-kit.md
   - check : 토큰과 같은 값을 직접 쓴 곳을 찾아 대체할 토큰을 알려준다
   외부 패키지 없이 Node 만으로 동작한다.

   사용법
     node scripts/ui-kit.js gen            생성
     node scripts/ui-kit.js gen --check    생성 결과가 최신인지 확인만 (다르면 종료 코드 1)
     node scripts/ui-kit.js check          하드코딩 검사
     node scripts/ui-kit.js check --strict 발견 시 종료 코드 1 (CI 용)

   검사 제외
     한 줄    : 그 줄에 ui-kit-ignore 를 주석으로 적는다
     여러 줄  : ui-kit-ignore-start 줄부터 ui-kit-ignore-end 줄까지
   ================================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ================================================================
   프로젝트 설정 — 다른 프로젝트에 설치할 때는 이 구간만 고친다
   경로는 모두 프로젝트 루트 기준이며 / 로 구분한다.
   ================================================================ */
// 컴포넌트 가이드 HTML 이 있는 폴더 (바로 아래 .html 파일만 읽는다)
const GUIDE_DIR = 'guide';
// 토큰을 정의한 CSS 파일 (:root 블록에 --이름: 값; 을 한 줄에 하나씩)
const TOKEN_CSS = 'resources/css/token.css';
// 하드코딩 검사 대상 폴더 (하위 폴더의 .css, .html 포함)
const CHECK_DIRS = ['html', 'guide', 'resources/css'];
// 1rem 이 몇 px 인지 (html 의 font-size)
const REM_PX = 16;

// 토큰 이름 접두사 → 그 토큰을 써야 하는 속성. 접두사를 프로젝트의 토큰 이름에 맞춘다.
// 색상은 접두사와 상관없이 값이 같은 토큰을 찾으므로 여기에 적지 않는다.
const PROP_GROUPS = [
  { prefix: '--fs-', props: /^font-size$/ },
  { prefix: '--fw-', props: /^font-weight$/ },
  { prefix: '--lh-', props: /^line-height$/ },
  { prefix: '--space-', props: /^(margin|padding)(-(top|right|bottom|left))?$|^(row-|column-)?gap$/ },
  { prefix: '--radius-', props: /^border(-(top|bottom)-(left|right))?-radius$/ },
  { prefix: '--z-', props: /^z-index$/ },
];
// 값 전체가 같아야 하는 속성
const WHOLE_GROUPS = [
  { prefix: '--font-', props: /^font-family$/ },
  { prefix: '--shadow-', props: /^box-shadow$/ },
];
/* ====================== 프로젝트 설정 끝 ====================== */

const SNIPPET_FILE = '.vscode/ui-components.code-snippets';
// 토큰·컴포넌트 목록 문서. CLAUDE.md 에서 @docs/ui-kit.md 로 불러온다.
const KIT_DOC = 'docs/ui-kit.md';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function fail(message) {
  console.error('오류: ' + message);
  process.exit(1);
}

/* ================================================================
   토큰 읽기 — token.css 의 첫 번째 :root 블록
   ================================================================ */
function readTokens() {
  if (!exists(TOKEN_CSS)) fail('토큰 CSS 파일이 없습니다: ' + TOKEN_CSS + ' (scripts/ui-kit.js 상단의 TOKEN_CSS 경로를 확인하세요)');
  const block = read(TOKEN_CSS).match(/:root\s*\{([^}]*)\}/);
  if (!block) fail(TOKEN_CSS + ' 에서 :root 블록을 찾지 못했습니다.');

  const tokens = [];
  let category = '기타';
  block[1].split('\n').forEach((raw) => {
    const line = raw.trim();
    const head = line.match(/^\/\*\s*-+\s*(.+?)\s*-+\s*\*\/$/);
    if (head) {
      category = head[1];
      return;
    }
    const decl = line.match(/^(--[\w-]+)\s*:\s*(.+?);\s*(?:\/\*\s*(.*?)\s*\*\/)?$/);
    if (decl) tokens.push({ name: decl[1], value: decl[2], note: decl[3] || '', category });
  });
  if (!tokens.length) fail(TOKEN_CSS + ' 에서 토큰을 찾지 못했습니다.');
  return tokens;
}

/* ================================================================
   스니펫 읽기 — <!-- @snippet 이름 | 설명 --> … <!-- @end -->
   ================================================================ */
// 공통 들여쓰기 제거 + 앞뒤 빈 줄 정리 (guide.js 의 dedent 와 같은 규칙)
function dedent(text) {
  const lines = text.replace(/\t/g, '  ').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  let min = Infinity;
  lines.forEach((l) => {
    if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length);
  });
  return lines.map((l) => l.slice(min === Infinity ? 0 : min).replace(/\s+$/, ''));
}

// 스니펫 문법에서 의미가 있는 문자를 일반 글자로 만든다
function escapeSnippet(text) {
  return text.replace(/[\\$]/g, '\\$&');
}

// 마크업 → 스니펫 본문. 고칠 만한 글자는 모두 탭 정지로 만든다. (문서 순서대로 번호를 매김)
//  - id 와 for 가 짝이면 같은 번호로 묶어 한 번에 바꾼다
//  - placeholder 값, 태그 사이의 글자(라벨·버튼·옵션·본문)가 대상이다
function toSnippetBody(html) {
  let text = escapeSnippet(dedent(html).join('\n'));
  const SEP = '\u0001';
  const slots = [];
  const mark = (key, value) => {
    slots.push({ key, value });
    return SEP + (slots.length - 1) + SEP;
  };
  const clean = (v) => v.replace(/\}/g, '\}');

  // id 와 for 가 짝인 경우: 같은 key 로 묶는다
  const ids = new Set(Array.from(text.matchAll(/\bid="([^"]+)"/g), (m) => m[1]));
  ids.forEach((id) => {
    if (!text.includes('for="' + id + '"')) return;
    ['id', 'for'].forEach((attr) => {
      text = text.split(attr + '="' + id + '"').join(attr + '="' + mark('id:' + id, id) + '"');
    });
  });

  // placeholder 값
  text = text.replace(/\bplaceholder="([^"\u0001]+)"/g, (m, v) => 'placeholder="' + mark('p' + slots.length, clean(v)) + '"');

  // 한 줄 안의 태그 사이 글자: <label>이름 <span>
  text = text.replace(/>([^<>\n\u0001]*[^\s<>\u0001][^<>\n\u0001]*)</g, (m, v) => {
    if (/^\s*[*‹›×]\s*$/.test(v)) return m;
    return '>' + mark('t' + slots.length, clean(v)) + '<';
  });

  // 태그 없이 글자만 있는 줄
  text = text.replace(/^( *)([^<>\n\u0001]*[^\s<>\u0001][^<>\n\u0001]*)$/gm, (m, sp, v) => sp + mark('l' + slots.length, clean(v)));

  // 번호는 문서에 나온 순서대로
  const order = new Map();
  text = text.replace(/\u0001(\d+)\u0001/g, (m, i) => {
    const { key, value } = slots[Number(i)];
    if (!order.has(key)) order.set(key, order.size + 1);
    return '${' + order.get(key) + ':' + value + '}';
  });

  return text.split('\n');
}

function readSnippets() {
  if (!exists(GUIDE_DIR)) fail('가이드 폴더가 없습니다: ' + GUIDE_DIR + ' (scripts/ui-kit.js 상단의 GUIDE_DIR 경로를 확인하세요)');
  const files = fs.readdirSync(path.join(ROOT, GUIDE_DIR)).filter((f) => f.endsWith('.html')).sort();
  const snippets = [];
  const seen = new Map();

  files.forEach((file) => {
    const rel = GUIDE_DIR + '/' + file;
    const html = read(rel);
    const opens = (html.match(/<!--\s*@snippet\b/g) || []).length;
    const pattern = /<!--\s*@snippet\s+([\w-]+)\s*\|\s*(.+?)\s*-->([\s\S]*?)<!--\s*@end\s*-->/g;
    let count = 0;
    let m;
    while ((m = pattern.exec(html))) {
      count += 1;
      const [, prefix, description, body] = m;
      if (/<!--\s*@snippet\b/.test(body)) fail(rel + ' 의 "' + prefix + '" 구간에 @end 가 빠졌습니다.');
      if (seen.has(prefix)) fail('스니펫 이름 "' + prefix + '" 이 중복됩니다. (' + seen.get(prefix) + ', ' + rel + ')');
      if (!body.trim()) fail(rel + ' 의 "' + prefix + '" 구간이 비어 있습니다.');
      seen.set(prefix, rel);
      snippets.push({ prefix, description, file: rel, body: toSnippetBody(body) });
    }
    if (count !== opens) fail(rel + ' 에 형식이 잘못된 @snippet 주석이 있습니다. (이름 | 설명, @end 확인)');
  });
  return snippets;
}

/* ================================================================
   gen — 스니펫 파일과 docs/ui-kit.md 자동 생성
   ================================================================ */
function buildSnippetFile(snippets) {
  const out = {};
  snippets.forEach((s) => {
    out[s.prefix] = {
      scope: 'html',
      prefix: s.prefix,
      body: s.body,
      description: s.description + ' — ' + s.file,
    };
  });
  return '// 자동 생성 파일입니다. 직접 고치지 말고 ' + GUIDE_DIR + '/*.html 을 수정한 뒤 npm run gen:vscode 를 실행하세요.\n'
    + JSON.stringify(out, null, 2) + '\n';
}

function buildKitDoc(tokens, snippets) {
  const lines = ['<!-- 자동 생성 파일입니다. 직접 고치지 말고 npm run gen:vscode 로 갱신하세요. -->', ''];

  lines.push('## 디자인 토큰 (' + TOKEN_CSS + ')', '');
  const groups = new Map();
  tokens.forEach((t) => {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category).push('`' + t.name + '` ' + t.value + (t.note ? ' (' + t.note + ')' : ''));
  });
  groups.forEach((items, category) => {
    lines.push('- **' + category + '**: ' + items.join(' / '));
  });

  lines.push('', '## 공통 컴포넌트 (' + GUIDE_DIR + '/*.html)', '');
  lines.push('정확한 마크업은 `' + SNIPPET_FILE + '` 의 같은 이름 항목을 따른다.', '');
  lines.push('| 이름 | 설명 | 가이드 |', '|---|---|---|');
  snippets.forEach((s) => {
    lines.push('| `' + s.prefix + '` | ' + s.description.replace(/\|/g, '\\|') + ' | ' + s.file + ' |');
  });

  return lines.join('\n') + '\n';
}

function gen(checkOnly) {
  const tokens = readTokens();
  const snippets = readSnippets();
  const outputs = [
    [SNIPPET_FILE, buildSnippetFile(snippets)],
    [KIT_DOC, buildKitDoc(tokens, snippets)],
  ];

  const stale = outputs.filter(([rel, content]) => !exists(rel) || read(rel) !== content);

  if (checkOnly) {
    if (stale.length) {
      stale.forEach(([rel]) => console.error('최신이 아님: ' + rel));
      console.error('npm run gen:vscode 를 실행해 갱신하세요.');
      process.exit(1);
    }
    console.log('최신 상태입니다. (토큰 ' + tokens.length + '개, 스니펫 ' + snippets.length + '개)');
    return;
  }

  stale.forEach(([rel, content]) => {
    fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');
    console.log('갱신: ' + rel);
  });
  console.log('토큰 ' + tokens.length + '개, 스니펫 ' + snippets.length + '개' + (stale.length ? '' : ' (변경 없음)'));
}

/* ================================================================
   check — 토큰과 같은 값을 직접 쓴 곳 찾기
   ================================================================ */
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

function normColor(value) {
  const v = value.toLowerCase().replace(/\s+/g, '');
  const short = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  return short ? '#' + short[1] + short[1] + short[2] + short[2] + short[3] + short[3] : v;
}

// 길이·숫자를 비교용 값으로 통일한다. rem 은 px 로 바꾼다. 비교 대상이 아니면 null.
function normNumber(value) {
  const m = value.trim().match(/^(\d*\.?\d+)(px|rem|%)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (n === 0) return null;
  if (m[2] === 'rem') return Math.round(n * REM_PX * 1000) / 1000 + 'px';
  return n + (m[2] || '');
}

function normWhole(value) {
  return value.toLowerCase().replace(/["']/g, '').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
}

function buildLookups(tokens) {
  const add = (map, key, name) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(name);
  };
  const colors = new Map();
  const groups = PROP_GROUPS.map((g) => ({ props: g.props, values: new Map() }));
  const wholes = WHOLE_GROUPS.map((g) => ({ props: g.props, values: new Map() }));

  tokens.forEach((t) => {
    if (/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))$/.test(t.value)) {
      add(colors, normColor(t.value), t.name);
      return;
    }
    PROP_GROUPS.forEach((g, i) => {
      const key = normNumber(t.value);
      if (t.name.startsWith(g.prefix) && key) add(groups[i].values, key, t.name);
    });
    WHOLE_GROUPS.forEach((g, i) => {
      if (t.name.startsWith(g.prefix) && !/var\(/.test(t.value)) add(wholes[i].values, normWhole(t.value), t.name);
    });
  });
  return { colors, groups, wholes };
}

// 길이를 유지한 채 CSS 주석을 공백으로 바꾼다 (줄·열 위치 보존)
function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
}

// 검사할 구간: [시작 위치, CSS 문자열]
function cssRegions(rel, text) {
  if (rel.endsWith('.css')) return [[0, blankComments(text)]];
  const regions = [];
  let m;
  const styleTag = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleTag.exec(text))) regions.push([m.index + m[0].indexOf('>') + 1, blankComments(m[1])]);
  const styleAttr = /\sstyle\s*=\s*"([^"]*)"/gi;
  while ((m = styleAttr.exec(text))) regions.push([m.index + m[0].indexOf('"') + 1, m[1]]);
  return regions;
}

// 검사에서 뺄 줄 번호.
// - 한 줄: 그 줄에 ui-kit-ignore 를 적는다
// - 여러 줄: ui-kit-ignore-start 줄부터 ui-kit-ignore-end 줄까지
function ignoredLines(text) {
  const ignored = new Set();
  let inBlock = false;
  text.split('\n').forEach((lineText, i) => {
    if (lineText.includes('ui-kit-ignore-start')) inBlock = true;
    if (inBlock || lineText.includes('ui-kit-ignore')) ignored.add(i + 1);
    if (lineText.includes('ui-kit-ignore-end')) inBlock = false;
  });
  return ignored;
}

// 같은 값의 색상 토큰이 여러 개면 속성에 맞는 쪽을 앞에 둔다 (color → --text-*, 그 외 → 배경·선 토큰)
function orderColorNames(prop, names) {
  const isText = (n) => n.startsWith('--text');
  const textFirst = prop === 'color';
  return names.slice().sort((a, b) => (isText(a) === isText(b) ? 0 : isText(a) === textFirst ? -1 : 1));
}

function checkFile(rel, lookups) {
  const text = read(rel);
  const ignored = ignoredLines(text);
  const findings = [];
  const report = (offset, prop, literal, names) => {
    const before = text.slice(0, offset);
    const line = before.split('\n').length;
    if (ignored.has(line)) return;
    const column = offset - before.lastIndexOf('\n');
    const suggestion = names.map((n) => 'var(' + n + ')').join(' 또는 ');
    findings.push({ rel, line, column, message: '토큰 사용 권장 — ' + prop + ': ' + literal + ' → ' + suggestion });
  };

  cssRegions(rel, text).forEach(([base, css]) => {
    // 1: 앞 구분자, 2: 속성, 3: 콜론과 공백, 4: 값 (값 위치 = 1~3 길이의 합)
    const decl = /(^|[;{\s])([a-zA-Z-]+)(\s*:\s*)([^;{}]+?)\s*(?=;|\}|$)/g;
    let m;
    while ((m = decl.exec(css))) {
      const prop = m[2].toLowerCase();
      const value = m[4];
      const valueAt = base + m.index + m[1].length + m[2].length + m[3].length;
      if (prop.startsWith('--')) continue;

      let c;
      COLOR_LITERAL.lastIndex = 0;
      while ((c = COLOR_LITERAL.exec(value))) {
        const names = lookups.colors.get(normColor(c[0]));
        if (names) report(valueAt + c.index, prop, c[0], orderColorNames(prop, names));
      }

      lookups.wholes.forEach((g) => {
        const names = g.props.test(prop) && g.values.get(normWhole(value));
        if (names) report(valueAt, prop, value, names);
      });

      lookups.groups.forEach((g) => {
        if (!g.props.test(prop)) return;
        const part = /\S+/g;
        let p;
        while ((p = part.exec(value))) {
          const key = normNumber(p[0]);
          const names = key && g.values.get(key);
          if (names) report(valueAt + p.index, prop, p[0], names);
        }
      });
    }
  });
  return findings;
}

function listFiles(dir) {
  const out = [];
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((entry) => {
    const rel = dir + '/' + entry.name;
    if (entry.isDirectory()) out.push(...listFiles(rel));
    else if (/\.(css|html)$/.test(entry.name) && rel !== TOKEN_CSS) out.push(rel);
  });
  return out.sort();
}

function check(strict) {
  const lookups = buildLookups(readTokens());
  const findings = [];
  CHECK_DIRS.filter(exists).forEach((dir) => {
    listFiles(dir).forEach((rel) => findings.push(...checkFile(rel, lookups)));
  });

  findings.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line || a.column - b.column);
  // VSCode 작업의 problemMatcher 가 읽는 형식: 파일:줄:열: 메시지
  findings.forEach((f) => console.log(f.rel + ':' + f.line + ':' + f.column + ': ' + f.message));
  console.log(findings.length ? '토큰으로 바꿀 수 있는 값 ' + findings.length + '건' : '토큰으로 바꿀 수 있는 값이 없습니다.');
  if (strict && findings.length) process.exit(1);
}

/* ================================================================
   실행
   ================================================================ */
const [command, ...flags] = process.argv.slice(2);
if (command === 'gen') gen(flags.includes('--check'));
else if (command === 'check') check(flags.includes('--strict'));
else {
  console.log('사용법: node scripts/ui-kit.js gen [--check] | check [--strict]');
  process.exit(command ? 1 : 0);
}
