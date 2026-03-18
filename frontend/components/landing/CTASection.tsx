// ═══════════════════════════════════════════════════════════════
// components/landing/CTASection.tsx — 행동 유도(Call-To-Action) 섹션
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 랜딩 페이지 하단에서 사용자에게 서비스 시작을 유도하는 섹션.
// "명함 정리, 지금 시작하세요" 타이틀과 "무료로 시작하기" 버튼을 표시한다.
// 서버 컴포넌트로 동작하며(use client 없음), 별도의 상태나 훅이 필요 없다.
//
// [코드 흐름]
// 1) 정적 렌더링 — 서버에서 HTML로 생성되어 클라이언트에 전달
// 2) "무료로 시작하기" 버튼 클릭 시 /login 페이지로 이동
//
// [컴포넌트/함수 목록]
// - CTASection(): CTA 타이틀 + 설명 + 시작하기 버튼을 렌더링하는 섹션 컴포넌트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// Link (next/link) — /login으로의 클라이언트 사이드 내비게이션
// Tailwind CSS     — 반응형 레이아웃, 호버 효과, 그림자 등 스타일링
// ───────────────────────────────────────────

import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center px-6">
      <div className="mx-auto max-w-2xl text-center">
        {/* CTA 타이틀 — "지금 시작하세요" 부분만 주황색 강조 */}
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          명함 정리,
          <br />
          <span className="text-[#FF8A3D]">지금 시작하세요</span>
        </h2>
        <p className="mx-auto mt-6 max-w-sm text-lg text-white/40">
          사진 한 장이면 됩니다.
          <br />
          복잡한 설정 없이 바로 사용할 수 있어요.
        </p>
        {/* CTA 버튼 — 호버 시 위로 살짝 떠오르는 효과 + 주황색 그림자 */}
        <Link
          href="/login"
          className="mt-12 inline-flex items-center gap-2 rounded-[10px] bg-[#FF8A3D] px-10 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#FF8A3D]/25"
        >
          무료로 시작하기
          {/* 오른쪽 화살표 SVG 아이콘 */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
