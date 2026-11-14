<!-- 자동 생성 파일입니다. 직접 고치지 말고 npm run gen:vscode 로 갱신하세요. -->

## 디자인 토큰 (resources/css/token.css)

- **색상: 브랜드**: `--accent` #2856C3 / `--accent-hover` #1E429D / `--accent-light` #EEF2FB / `--accent-ring` rgba(40, 86, 195, 0.1) (포커스 링)
- **색상: 배경 / 면**: `--bg` #F5F4F0 / `--surface` #FFFFFF / `--surface-alt` #FAFAF8 / `--dark` #1C1C1C (푸터 등 어두운 배경)
- **색상: 선**: `--border` #E5E3DD / `--border-strong` #D0CEC7
- **색상: 텍스트**: `--text` #1C1C1C / `--text-sub` #5A5752 / `--text-muted` #9B978F / `--text-inverse` #FFFFFF
- **색상: 상태**: `--danger` #D93025 / `--danger-light` #FDECEA / `--success` #188038 / `--success-light` #E8F5E9 / `--warning` #E8A317 / `--warning-light` #FFF8E1 / `--star` #F5B100 (별점)
- **타이포: 폰트 패밀리**: `--font-base` 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif / `--font-mono` 'JetBrains Mono', monospace
- **타이포: 크기 (rem × 16 = px)**: `--fs-2xs` 0.625rem (10px) / `--fs-xs` 0.75rem (12px) / `--fs-sm` 0.875rem (14px) / `--fs-md` 1rem (16px) / `--fs-lg` 1.125rem (18px) / `--fs-xl` 1.25rem (20px) / `--fs-2xl` 1.5rem (24px) / `--fs-3xl` 2rem (32px) / `--fs-4xl` 2.5rem (40px) / `--fs-5xl` 3rem (48px)
- **타이포: 굵기**: `--fw-regular` 400 / `--fw-medium` 500 / `--fw-semibold` 600 / `--fw-bold` 700
- **타이포: 행간**: `--lh-tight` 1.3 / `--lh-base` 1.6 / `--lh-loose` 1.7
- **간격 (4px 그리드)**: `--space-1` 0.25rem (4px) / `--space-2` 0.5rem (8px) / `--space-3` 0.75rem (12px) / `--space-4` 1rem (16px) / `--space-5` 1.5rem (24px) / `--space-6` 2rem (32px) / `--space-7` 3rem (48px) / `--space-8` 4rem (64px) / `--space-9` 5rem (80px)
- **라운드**: `--radius-xs` 3px / `--radius-sm` 4px / `--radius-md` 8px / `--radius-lg` 12px / `--radius-xl` 16px / `--radius-pill` 20px / `--radius-full` 50%
- **그림자**: `--shadow-sm` 0 1px 3px rgba(0, 0, 0, 0.2) / `--shadow-md` 0 4px 12px rgba(0, 0, 0, 0.08) / `--shadow-focus` 0 0 0 3px var(--accent-ring)
- **모션**: `--duration` 0.25s / `--ease` ease / `--transition` all var(--duration) var(--ease)
- **레이어 (z-index)**: `--z-gnb` 99 / `--z-header` 100 / `--z-overlay` 200
- **레이아웃**: `--container-max` 1200px / `--header-h` 56px (모바일 헤더 높이 (768px+ 에서 64px))

## 공통 컴포넌트 (guide/*.html)

정확한 마크업은 `.vscode/ui-components.code-snippets` 의 같은 이름 항목을 따른다.

| 이름 | 설명 | 가이드 |
|---|---|---|
| `btn-primary` | 버튼 Primary (주요 행동, 화면당 1개 권장) | guide/btn.html |
| `btn-outline` | 버튼 Outline (보조 행동) | guide/btn.html |
| `btn-danger` | 버튼 Danger (삭제·취소 등 위험 동작) | guide/btn.html |
| `btn-sm` | 작은 버튼 | guide/btn.html |
| `btn-lg` | 큰 버튼 | guide/btn.html |
| `btn-disabled` | 비활성 버튼 (disabled 속성) | guide/btn.html |
| `btn-link-disabled` | 비활성 링크 버튼 (.disabled 클래스) | guide/btn.html |
| `btn-block` | 전체 너비 버튼 (모바일 하단 CTA) | guide/btn.html |
| `btn-icon` | 아이콘 + 텍스트 버튼 | guide/btn.html |
| `btn-link` | 링크(a) 버튼 | guide/btn.html |
| `btn-group` | 버튼 그룹 (취소 / 확인) | guide/btn.html |
| `input-group` | 입력 + 버튼 한 줄 | guide/btn.html |
| `badge-primary` | 배지 Primary | guide/components.html |
| `badge-success` | 배지 Success | guide/components.html |
| `badge-danger` | 배지 Danger | guide/components.html |
| `badge-warning` | 배지 Warning | guide/components.html |
| `tab-filters` | 탭 필터 (칩) | guide/components.html |
| `pagination` | 페이지네이션 | guide/components.html |
| `card` | 카드 (이미지 + 본문) | guide/components.html |
| `tbl` | 반응형 테이블 | guide/components.html |
| `form-input` | 텍스트 입력 (라벨 + 필수 표시) | guide/form.html |
| `form-input-hint` | 텍스트 입력 + 힌트 문구 | guide/form.html |
| `form-input-error` | 입력 에러 상태 | guide/form.html |
| `form-input-success` | 입력 성공 상태 | guide/form.html |
| `form-input-disabled` | 입력 비활성 상태 | guide/form.html |
| `form-select` | 셀렉트 | guide/form.html |
| `form-select-sm` | 작은 셀렉트 (정렬·필터) | guide/form.html |
| `form-textarea` | 텍스트 영역 + 글자 수 힌트 | guide/form.html |
| `form-radio` | 라디오 그룹 (가로 나열) | guide/form.html |
| `form-check` | 체크박스 | guide/form.html |
| `toggle` | 토글 스위치 (설명 + 스위치) | guide/form.html |
| `file-upload` | 파일 업로드 영역 | guide/form.html |
| `form-row` | 폼 2열 그리드 (768px 이상) | guide/form.html |
| `form-row-3` | 폼 3열 그리드 (576px 이상) | guide/form.html |
