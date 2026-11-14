/* ================================================================
   guide.js — .guide-demo 안의 마크업을 바로 아래 코드 블록으로 출력
   - data-no-code 가 있으면 건너뜀
   - @snippet / @end 주석(VSCode 스니펫 생성용)은 코드 블록에 출력하지 않음
   ================================================================ */
(function () {

  // 스니펫 구간 표시 주석을 줄째로 제거
  function stripMarkers(text) {
    return text.replace(/^[ \t]*<!--\s*@(snippet|end)\b[^\n]*-->[ \t]*\r?\n?/gm, '');
  }

  // 공통 들여쓰기 제거 + 앞뒤 공백 정리
  function dedent(text) {
    var lines = text.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var min = Infinity;
    lines.forEach(function (l) {
      if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length);
    });
    return lines.map(function (l) { return l.slice(min === Infinity ? 0 : min); }).join('\n');
  }

  document.querySelectorAll('.guide-demo').forEach(function (demo) {
    if (demo.hasAttribute('data-no-code')) return;
    var pre = document.createElement('pre');
    pre.className = 'guide-code';
    pre.textContent = dedent(stripMarkers(demo.innerHTML));
    demo.after(pre);
  });
})();
