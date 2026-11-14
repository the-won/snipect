# 회사 서비스 프로젝트에 설치하기

이 폴더(`files35345`)는 시험용 프로젝트입니다.
이 문서는 여기서 만든 VSCode 추천 환경을 **실제 서비스 프로젝트**로 옮기는 순서를 적은 것입니다.
쓰는 법은 [README.md](README.md)에 있습니다.

걸리는 시간: 준비물 설치 10분, 파일 복사와 경로 수정 10분, 가이드에 마커 달기는 컴포넌트 수만큼.

---

## 1. 회사 PC 준비물 확인

이 폴더를 통째로 회사 PC로 가져간 뒤(압축 파일, USB 등), **먼저 이 폴더를 VSCode로 열어** 아래가 되는지 확인합니다. 여기서 되면 회사 프로젝트에서도 됩니다.

### 1-1. Node.js (12 이상)

명령 프롬프트에서 확인합니다.

```
node -v
```

- 버전이 나오고 12 이상이면 통과
- 없으면 https://nodejs.org 에서 LTS 설치
- **Windows 7이면** 13.14.0이 설치 가능한 마지막 버전입니다. (https://nodejs.org/dist/v13.14.0/ 의 `node-v13.14.0-x64.msi`)

Node는 스니펫 생성과 토큰 검사에만 씁니다. 서비스 코드에는 영향이 없습니다.

### 1-2. VSCode 확장 2개

| 확장 | ID | 하는 일 |
|---|---|---|
| CSS Variable Autocomplete | `vunguyentuan.vscode-css-variables` | `var(--` 입력 시 토큰 추천 |
| HTML CSS Support | `ecmel.vscode-html-css` | `class="` 입력 시 공통 클래스 추천 |

**인터넷이 되는 PC**: 폴더를 열면 오른쪽 아래에 뜨는 권장 확장 안내에서 **설치**. 안내가 없으면 확장 탭(`Ctrl+Shift+X`)에서 `@recommended` 검색.

**마켓플레이스가 막힌 PC**: 인터넷이 되는 PC에서 설치 파일(`.vsix`)을 받아 옮깁니다.
1. 인터넷 되는 PC의 VSCode 확장 탭에서 확장을 마우스 오른쪽 클릭 → **VSIX 다운로드**
2. 회사 PC의 확장 탭 → 오른쪽 위 `…` → **VSIX에서 설치** → 받은 파일 선택

**VSCode가 오래된 버전이면**(Windows 7은 1.70.3이 마지막) 최신 확장이 "호환되지 않음"으로 설치되지 않을 수 있습니다. 확장 탭에서 확장의 톱니바퀴 → **다른 버전 설치**로 이전 버전을 고릅니다. 그래도 안 되면 확장 없이 진행해도 됩니다. 컴포넌트 스니펫과 토큰 검사는 확장이 필요 없습니다.

### 1-3. 이 폴더에서 동작 확인

- [ ] `resources/css/common.css`에서 `color: var(--` 입력 → 토큰 목록이 뜬다
- [ ] `html/01-main.html`의 `<body>` 안에서 `btn` 입력 → `btn-primary` 등이 목록 맨 위에 뜬다
- [ ] 같은 파일에서 `class="` 입력 → `btn`, `form-input` 등 클래스가 뜬다
- [ ] `Ctrl+Shift+P` → `작업: 작업 실행` → `UI: 토큰 하드코딩 검사` → 문제 패널(`Ctrl+Shift+M`)에 경고가 나온다

---

## 2. 회사 프로젝트로 파일 복사

**VSCode로 여는 폴더(프로젝트 루트)** 기준으로 같은 위치에 둡니다. `scripts/`와 `.vscode/`가 그 폴더 바로 아래에 있어야 합니다.

| 파일 | 회사 프로젝트에 같은 파일이 없으면 | 이미 있으면 |
|---|---|---|
| `scripts/ui-kit.js` | 그대로 복사 | (새 파일이라 해당 없음) |
| `.vscode/extensions.json` | 그대로 복사 | `recommendations`에 확장 ID 2개 추가 |
| `.vscode/tasks.json` | 그대로 복사 | `tasks` 배열에 작업 2개 추가 |
| `.vscode/settings.json` | 아래 3개 설정만 넣어 새로 작성 | 아래 3개 설정 추가 |
| `package.json` | 복사 후 `name` 수정 (선택) | `scripts`에 3줄 추가 |
| `CLAUDE.md` | Claude Code를 쓸 때만 복사, 위쪽 규칙은 회사 기준으로 수정 | `docs/ui-kit.md`를 불러오는 줄이 있으므로 `docs/` 폴더도 함께 복사 (목록은 3단계에서 자동 생성) |
| `README.md` | 팀 안내용으로 복사 (선택) | 내용을 기존 문서에 옮겨 적기 |

`.vscode/settings.json`에 넣을 설정 (`liveServer` 포트는 시험용 설정이므로 가져가지 않습니다)

```jsonc
{
  "cssVariables.lookupFiles": ["**/resources/css/token.css"],
  "css.styleSheets": ["resources/css/common.css"],
  "editor.snippetSuggestions": "top"
}
```

`package.json`의 `scripts`에 넣을 3줄

```json
"gen:vscode": "node scripts/ui-kit.js gen",
"gen:vscode:check": "node scripts/ui-kit.js gen --check",
"check:tokens": "node scripts/ui-kit.js check"
```

`package.json`을 두고 싶지 않으면 생략해도 됩니다. 이 경우 `npm run gen:vscode` 대신 `node scripts/ui-kit.js gen`을 직접 실행합니다.

**가져가지 않는 것**: `guide/`, `html/`, `resources/`(시험용 페이지), `.vscode/ui-components.code-snippets`(3단계에서 새로 만들어짐), `INSTALL.md`

---

## 3. 회사 프로젝트 경로에 맞추기

고칠 곳은 두 군데입니다.

### 3-1. `scripts/ui-kit.js` 상단의 "프로젝트 설정" 구간

```js
const GUIDE_DIR = 'guide';                              // 컴포넌트 가이드 HTML 폴더
const TOKEN_CSS = 'resources/css/token.css';            // 토큰을 정의한 CSS 파일
const CHECK_DIRS = ['html', 'guide', 'resources/css'];  // 하드코딩 검사 대상 폴더
const REM_PX = 16;                                      // 1rem = 몇 px
```

- 경로는 프로젝트 루트 기준, `/`로 구분합니다. 예: `'pub/guide'`, `'assets/css/variables.css'`
- `REM_PX`: `html { font-size: 62.5% }`를 쓰는 프로젝트면 `10`

바로 아래의 `PROP_GROUPS`, `WHOLE_GROUPS`는 토큰 검사용입니다. 접두사를 회사 토큰 이름에 맞춥니다.

```js
// 예: 회사 토큰이 --font-size-sm, --gap-md, --primary-font 라면
{ prefix: '--font-size-', props: /^font-size$/ },
{ prefix: '--gap-', props: /^(margin|padding)…/ },
{ prefix: '--primary-font', props: /^font-family$/ },
```

- 색상은 접두사와 상관없이 값이 같은 토큰을 찾으므로 고칠 것이 없습니다.
- 해당 종류의 토큰이 없으면 그 줄은 그대로 둬도 됩니다. (맞는 토큰이 없으면 아무것도 찾지 않음)
- 토큰 검사가 필요 없으면 이 부분은 건너뜁니다. 추천 기능과는 무관합니다.

### 3-2. `.vscode/settings.json`의 경로 2개

```jsonc
"cssVariables.lookupFiles": ["**/토큰 CSS 경로"],
"css.styleSheets": ["공통 CSS 경로"]
```

공통 CSS가 여러 개면 배열에 나열합니다. 예: `["assets/css/common.css", "assets/css/layout.css"]`

### 전제 조건 (다르면 먼저 알려 주세요)

- 토큰이 CSS 파일의 `:root { --이름: 값; }` 형태이고, 한 줄에 하나씩 적혀 있다. (SCSS 변수 `$이름`은 지원하지 않음)
- 가이드가 `.html` 파일이고 한 폴더에 모여 있다. (하위 폴더는 읽지 않음)
- 파일 인코딩이 UTF-8이다. (EUC-KR이면 한글 설명이 깨짐)

---

## 4. 가이드에 마커 달고 스니펫 만들기

1. 가이드 HTML에서 **버튼 2~3개만 먼저** 주석으로 감쌉니다.

   ```html
   <!-- @snippet btn-primary | 기본 버튼 -->
   <button type="button" class="btn btn-primary">확인</button>
   <!-- @end -->
   ```

   - 이름: VSCode에서 입력할 글자. 영문·숫자·`-`만, 프로젝트 전체에서 중복 없이
   - `|` 뒤: 추천 목록에 보이는 설명
   - 감싼 안쪽에는 **실제로 복사해 쓸 마크업만** 둡니다. 데모용 인라인 style이 있으면 스니펫에도 그대로 들어갑니다.

2. 프로젝트 루트에서 실행합니다.

   ```
   node scripts/ui-kit.js gen
   ```

   `갱신: .vscode/ui-components.code-snippets`와 `토큰 N개, 스니펫 N개`가 나오면 성공입니다.

3. HTML 파일에서 방금 붙인 이름을 입력해 추천이 뜨는지 확인합니다.

4. 잘 되면 나머지 컴포넌트에도 마커를 달고 다시 실행합니다.

### 가이드 화면에 마커 주석이 보일 때 (해당하는 경우만)

가이드가 데모 마크업을 자바스크립트로 읽어 코드 블록에 보여 주는 구조면 `@snippet` 주석도 같이 출력됩니다. 이 폴더의 `resources/js/guide.js`에 있는 `stripMarkers` 함수를 회사 가이드 스크립트에 옮겨, 코드로 출력하기 전에 거치게 합니다.

```js
function stripMarkers(text) {
  return text.replace(/^[ \t]*<!--\s*@(snippet|end)\b[^\n]*-->[ \t]*\r?\n?/gm, '');
}
```

코드 예시를 손으로 따로 적어 두는 가이드라면 할 일이 없습니다.

---

## 5. 설치 확인

- [ ] CSS에서 `var(--` 입력 → **회사 토큰**이 뜬다
- [ ] HTML에서 스니펫 이름 입력 → 가이드와 같은 마크업이 들어간다
- [ ] HTML에서 `class="` 입력 → **회사 공통 클래스**가 뜬다
- [ ] 가이드의 마크업을 하나 고치고 `node scripts/ui-kit.js gen` → 스니펫에 반영된다
- [ ] 가이드 화면을 브라우저로 열어 깨진 곳이나 주석 노출이 없다
- [ ] (선택) `node scripts/ui-kit.js check` → 결과가 `파일:줄:열: 토큰 사용 권장 — …` 형식으로 나온다

토큰 검사는 처음 실행하면 기존 페이지에서 많이 나옵니다. 한꺼번에 고치지 말고 새로 작업하는 화면부터 적용하는 것을 권합니다. 토큰과 값이 우연히 같을 뿐인 곳은 `ui-kit-ignore` 주석으로 제외합니다. (README 참고)

---

## 6. 팀에 공유

아래 파일을 저장소에 올리면, 팀원은 프로젝트를 받아 열고 권장 확장만 설치하면 됩니다.

```
scripts/ui-kit.js
.vscode/settings.json
.vscode/extensions.json
.vscode/tasks.json
.vscode/ui-components.code-snippets
package.json            (추가했다면)
CLAUDE.md               (추가했다면)
docs/ui-kit.md          (gen:vscode 로 자동 생성)
가이드 HTML             (마커를 단 파일)
```

`.gitignore`에 `.vscode/`가 있으면 위 파일이 올라가지 않습니다. 아래처럼 바꿉니다.

```
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
!.vscode/tasks.json
!.vscode/ui-components.code-snippets
```

`.vscode/settings.json`에 개인 설정이 섞여 있으면, 위 3개 설정만 남기고 나머지는 각자의 사용자 설정으로 옮깁니다.

---

## 문제가 생기면

| 증상 | 확인할 것 |
|---|---|
| `오류: 토큰 CSS 파일이 없습니다` / `가이드 폴더가 없습니다` | `scripts/ui-kit.js` 상단의 `TOKEN_CSS`, `GUIDE_DIR` 경로. 프로젝트 루트 기준인지 |
| `:root 블록을 찾지 못했습니다` / `토큰을 찾지 못했습니다` | 토큰이 `:root { }` 안에 `--이름: 값;` 한 줄씩 있는지 |
| `형식이 잘못된 @snippet 주석` / `@end 가 빠졌습니다` | `<!-- @snippet 이름 \| 설명 -->` 형식과 짝이 맞는 `<!-- @end -->` |
| 스니펫 이름을 쳐도 안 뜬다 | 파일 언어 모드가 HTML인지(오른쪽 아래). `.vscode`가 VSCode로 연 폴더 바로 아래에 있는지. 안 뜨면 `Ctrl+Space` |
| `var(--`에서 토큰이 안 뜬다 | 확장 설치 여부, `cssVariables.lookupFiles` 경로. 고친 뒤 `Ctrl+Shift+P` → `창 다시 로드` |
| `class="`에서 클래스가 안 뜬다 | 확장 설치 여부, `css.styleSheets` 경로(프로젝트 루트 기준) |
| 클래스가 두 번씩 뜬다 | 클래스 자동완성 확장이 두 개 설치된 경우. 하나를 이 작업 영역에서 사용 안 함으로 |
| 한글 설명이 깨진다 | 가이드 HTML의 인코딩이 UTF-8인지 |
| 작업 실행 시 `node`를 찾지 못한다 | Node 설치 후 VSCode를 완전히 껐다 켜기 |
