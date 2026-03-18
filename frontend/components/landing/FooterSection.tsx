// ═══════════════════════════════════════════════════════════════
// components/landing/FooterSection.tsx — 하단 푸터 섹션
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 랜딩 페이지 최하단에 표시되는 푸터.
// MORA 로고, 저작권 표시, GitHub 저장소 링크를 포함한다.
// 서버 컴포넌트로 동작하며(use client 없음), 정적 HTML로 렌더링된다.
//
// [코드 흐름]
// 1) 정적 렌더링 — 서버에서 HTML로 생성
// 2) 3개 요소를 가로 배치: MORA 로고 | 저작권 문구 | GitHub 링크
// 3) sm 브레이크포인트 이하에서는 세로 배치로 전환 (반응형)
//
// [컴포넌트/함수 목록]
// - FooterSection(): MORA 로고 + 저작권 + GitHub 링크를 표시하는 푸터 컴포넌트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// Tailwind CSS — 반응형 레이아웃(flex-col → sm:flex-row), 색상, 호버 효과
// ───────────────────────────────────────────

export default function FooterSection() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* MORA 로고 — 로고 전용 폰트 사용 */}
        <span className="font-[var(--font-logo)] text-xl tracking-[3px] text-[#FF8A3D]">
          MORA
        </span>

        {/* 저작권 문구 */}
        <p className="text-xs text-white/25">
          &copy; 2026 MORA. All rights reserved.
        </p>

        {/* GitHub 저장소 링크 — 새 탭에서 열림 */}
        <a
          href="https://github.com/lavermeanyou/OCR_FOR_MORA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/30 transition-colors hover:text-white/60"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
