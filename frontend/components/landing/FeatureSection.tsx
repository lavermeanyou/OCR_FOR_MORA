// ═══════════════════════════════════════════════════════════════
// components/landing/FeatureSection.tsx — 주요 기능 소개 섹션
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// MORA의 4가지 주요 기능을 2x2 그리드 카드로 소개하는 섹션.
// 한국어/영어 인식, 2초 완료, 자연어 검색, 자동 저장 기능을 설명한다.
// IntersectionObserver로 스크롤 시 전체 그리드가 페이드인된다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 IntersectionObserver 설정
// 2) ref div(전체 컨테이너)를 opacity: 0, translateY: 40px로 초기화
// 3) 사용자가 스크롤하여 15% 이상 보이면 페이드인 + 슬라이드업
// 4) FEATURES 배열을 순회하며 체크마크 아이콘 + 제목 + 설명 카드 렌더링
//
// [컴포넌트/함수 목록]
// - FeatureSection(): 기능 소개 헤더 + 2x2 그리드 카드를 렌더링하는 섹션 컴포넌트
// - FEATURES[]:       4가지 기능의 제목(title)과 설명(desc)을 담은 데이터 배열
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useRef()                  — 그리드 컨테이너 div에 직접 접근
// useEffect()               — IntersectionObserver 등록/해제
// IntersectionObserver (Web API) — 뷰포트 진입 시 애니메이션 트리거
//   - threshold: 0.15       — 15% 보이면 콜백 실행
// ───────────────────────────────────────────

'use client'

import { useEffect, useRef } from 'react'

// 4가지 주요 기능 데이터
const FEATURES = [
  {
    title: '한국어/영어 모두 인식',
    desc: '한글 명함, 영문 명함 가리지 않습니다.',
  },
  {
    title: '촬영 후 2초면 완료',
    desc: '기다릴 필요 없이, 사진 올리면 바로 결과가 나옵니다.',
  },
  {
    title: '"김 대리" 로 검색 가능',
    desc: '이름 일부, 회사명, 직책 등 기억나는 것만으로 찾을 수 있습니다.',
  },
  {
    title: '내 명함함에 자동 저장',
    desc: '스캔한 명함은 자동으로 저장되어 언제든 다시 볼 수 있습니다.',
  },
]

export default function FeatureSection() {
  const ref = useRef<HTMLDivElement>(null)

  // IntersectionObserver로 뷰포트 진입 시 페이드인 애니메이션
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.15 }
    )
    // 초기 상태: 숨김
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="feature" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div ref={ref} style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
        {/* 섹션 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#FF8A3D' }}>주요 기능</p>
          <h2 style={{ marginTop: 16, fontSize: 42, fontWeight: 700, color: 'white' }}>
            이런 것도 됩니다
          </h2>
        </div>

        {/* 2x2 기능 카드 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: 32,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {/* 체크마크 아이콘 원형 배경 */}
              <div style={{
                marginTop: 2,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,138,61,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg style={{ width: 16, height: 16, color: '#FF8A3D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              {/* 기능 제목 + 설명 */}
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{f.title}</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
