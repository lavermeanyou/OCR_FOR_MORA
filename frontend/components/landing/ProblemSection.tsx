// ═══════════════════════════════════════════════════════════════
// components/landing/ProblemSection.tsx — 문제 제기 섹션
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 랜딩 페이지에서 사용자의 공감을 유도하는 섹션.
// "명함 받고 나서 어디에 뒀는지 기억나시나요?" 라는 질문으로
// 명함 관리의 불편함을 상기시킨다.
// IntersectionObserver를 사용하여 화면에 보일 때 페이드인 애니메이션을 적용한다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 useEffect에서 IntersectionObserver 설정
// 2) div 요소를 opacity: 0, translateY: 40px 상태로 초기화 (숨김)
// 3) 사용자가 스크롤하여 이 섹션이 화면의 30% 이상 보이면
//    (threshold: 0.3) entry.isIntersecting = true
// 4) opacity: 1, translateY: 0으로 전환 → 부드럽게 나타나는 효과
// 5) 컴포넌트 언마운트 시 observer를 disconnect하여 정리
//
// [컴포넌트/함수 목록]
// - ProblemSection(): 문제 제기 텍스트 + 스크롤 페이드인 애니메이션 컴포넌트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useRef()                  — div 요소에 직접 접근하여 스타일 조작
// useEffect()               — 마운트 시 IntersectionObserver 등록/해제
// IntersectionObserver (Web API) — 요소가 뷰포트에 진입했는지 감지
//   - threshold: 0.3        — 30% 이상 보일 때 콜백 실행
//   - obs.observe(el)       — 관찰 시작
//   - obs.disconnect()      — 관찰 중단 (클린업)
// ───────────────────────────────────────────

'use client'

import { useEffect, useRef } from 'react'

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // IntersectionObserver로 요소가 뷰포트에 30% 이상 보일 때 애니메이션 시작
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 페이드인 + 슬라이드업 애니메이션 적용
          el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.3 }
    )

    // 초기 상태: 투명 + 40px 아래로 이동 (숨김 상태)
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    obs.observe(el)

    return () => obs.disconnect()  // 클린업: observer 해제
  }, [])

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center px-6">
      <div ref={ref} className="mx-auto max-w-3xl text-center">
        <p className="text-3xl font-medium leading-snug text-white/80 md:text-5xl md:leading-snug">
          명함 받고 나서
          <br />
          <span className="text-white">어디에 뒀는지 기억나시나요?</span>
        </p>
        <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-white/35">
          주머니에 넣고, 지갑에 꽂고, 책상 위에 쌓아두고.
          <br />
          정작 필요할 때 찾을 수 없었던 경험, 한번쯤 있으시죠?
        </p>
      </div>
    </section>
  )
}
