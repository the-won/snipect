# 퍼블리싱 작업 가이드 — VSCode 추천 환경

디자인 토큰과 공통 컴포넌트를 외우지 않아도 VSCode가 입력 중에 추천해 줍니다.
설정은 모두 이 저장소에 들어 있어서, 폴더를 VSCode로 열고 추천 확장만 설치하면 됩니다.

다른 프로젝트(실제 서비스)에 이 환경을 옮겨 설치하는 방법은 [INSTALL.md](INSTALL.md)에 있습니다.

## 처음 한 번

1. 이 폴더를 VSCode로 엽니다.
2. 오른쪽 아래에 뜨는 "권장 확장 설치" 안내에서 **설치**를 누릅니다.
   안내가 안 보이면 확장 탭에서 `@recommended`를 검색해 아래 두 개를 설치합니다.
   - CSS Variable Autocomplete (`vunguyentuan.vscode-css-variables`)
   - HTML CSS Support (`ecmel.vscode-html-css`)
3. Node.js 12 이상이 설치돼 있어야 합니다. (`node -v`로 확인. 스니펫 생성과 검사에만 사용)

## 쓰는 법

| 하고 싶은 일 | 입력 | 결과 |
|---|---|---|
| 토큰 찾기 | CSS에서 `var(--` | 토큰 목록과 실제 값(색상 미리보기 포함) |
| 공통 컴포넌트 넣기 | HTML에서 `btn`, `form`, `badge` 등 | 컴포넌트 목록 → 고르면 가이드와 같은 마크업 삽입 |
| 공통 클래스 찾기 | HTML에서 `class="` | `common.css`의 클래스 목록 |
| 토큰 안 쓴 곳 찾기 | `Ctrl+Shift+P` → `작업: 작업 실행` → `UI: 토큰 하드코딩 검사` | 문제 패널과 편집기 밑줄로 표시, 바꿀 토큰 이름 안내 |

컴포넌트를 넣은 뒤 `Tab`을 누르면 바꿀 문구(버튼 글자, id 등)로 차례로 이동합니다.

컴포넌트 이름 목록은 [docs/ui-kit.md](docs/ui-kit.md)의 "공통 컴포넌트" 표에 있습니다.

## 공통 컴포넌트를 추가하거나 고칠 때

가이드 HTML이 유일한 원본입니다. 스니펫 파일을 직접 고치지 않습니다.

1. `guide/*.html`의 예시 마크업을 주석으로 감쌉니다.

   ```html
   <!-- @snippet btn-primary | 버튼 Primary (주요 행동) -->
   <button type="button" class="btn btn-primary">Primary</button>
   <!-- @end -->
   ```

   - `btn-primary`: VSCode에서 입력할 이름 (영문, 숫자, `-`)
   - `|` 뒤: 추천 목록에 보이는 설명
   - 이 주석은 가이드 화면의 코드 블록에는 나오지 않습니다.

2. 생성 명령을 실행하고, 바뀐 파일을 함께 커밋합니다.

   ```
   npm run gen:vscode
   ```

   `.vscode/ui-components.code-snippets`와 `docs/ui-kit.md`가 갱신됩니다.
   토큰(`resources/css/token.css`)을 추가하거나 고친 뒤에도 같은 명령을 실행합니다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run gen:vscode` | 스니펫과 `docs/ui-kit.md` 목록 생성 |
| `npm run gen:vscode:check` | 생성 결과가 최신인지 확인만 (최신이 아니면 실패) |
| `npm run check:tokens` | 토큰과 같은 값을 직접 쓴 곳 찾기 |

## 토큰 검사에서 빼고 싶을 때

토큰과 값이 우연히 같을 뿐인 곳(예: 상품 색상 칩)은 주석으로 제외합니다.

```css
html { font-size: 16px; /* ui-kit-ignore */ }
```

```html
<!-- ui-kit-ignore-start -->
<div class="color-swatch" style="background:#D93025;"></div>
<!-- ui-kit-ignore-end -->
```

## Claude Code를 쓸 때

`CLAUDE.md`가 `docs/ui-kit.md`(토큰과 공통 컴포넌트 목록)를 불러오므로, 이 폴더에서 Claude Code로 마크업을 만들면 공통 자산을 사용합니다. 목록은 `npm run gen:vscode`로 함께 갱신됩니다.
