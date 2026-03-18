// ═══════════════════════════════════════════════════════════════
// components/landing/HowToSection.tsx — 사용법 3단계 안내 섹션
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// MORA의 핵심 사용 흐름을 3단계(촬영 → AI 정리 → 검색)로 시각적으로 안내한다.
// 각 단계는 좌우 교차(지그재그) 레이아웃으로 배치되며,
// IntersectionObserver로 스크롤 시 하나씩 페이드인된다.
//
// [코드 흐름]
// 1) 섹션 상단 헤더("3단계면 충분해요")가 먼저 페이드인
// 2) 스크롤하면 각 StepBlock이 순서대로 페이드인 + 슬라이드업
// 3) 짝수 인덱스(0,2)는 비주얼이 왼쪽, 홀수(1)는 비주얼이 오른쪽 배치
// 4) 각 StepBlock의 visual 속성에 인라인 JSX로 일러스트/목업 UI 포함
//
// [컴포넌트/함수 목록]
// - HowToSection(): 전체 섹션 — 헤더 + 3개의 StepBlock 렌더링
// - StepBlock():     개별 단계 블록 — 비주얼 + 텍스트 (좌우 교차 배치)
// - STEPS[]:         3단계 데이터 배열 (num, title, desc, visual JSX)
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useRef()                  — 헤더 div, 각 StepBlock div에 직접 접근
// useEffect()               — IntersectionObserver 등록/해제
// IntersectionObserver (Web API) — 뷰포트 진입 감지
//   - threshold: 0.15~0.3   — 요소가 15~30% 보일 때 애니메이션 시작
// ───────────────────────────────────────────

'use client'

import { useEffect, useRef } from 'react'

// 3단계 사용법 데이터 — 각 단계의 번호, 제목, 설명, 시각적 요소(JSX)
const STEPS = [
  {
    num: '1',
    title: '명함을 촬영하세요',
    desc: '스마트폰 카메라로 찍거나, 이미지 파일을 업로드하면 됩니다.',
    visual: (
      // 스마트폰 카메라 아이콘 + 명함 목업
      <div style={{ position: 'relative', width: 180, height: 260, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
        <svg style={{ width: 64, height: 64, color: 'rgba(255,138,61,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
        {/* 하단의 미니 명함 목업 */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, height: 96, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg, #1a2a3f, #0f1c2e)', padding: 12 }}>
          <div style={{ height: 8, width: 64, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ height: 6, width: 40, borderRadius: 4, background: 'rgba(255,138,61,0.3)', marginTop: 6 }} />
          <div style={{ height: 6, width: 80, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 12 }} />
          <div style={{ height: 6, width: 64, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 4 }} />
        </div>
      </div>
    ),
  },
  {
    num: '2',
    title: 'AI가 자동으로 정리합니다',
    desc: '이름, 회사, 직책, 전화번호, 이메일을 알아서 분류해줍니다.',
    visual: (
      // OCR 결과 필드 목업 — 라벨:값 쌍 리스트
      <div style={{ width: 300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: '이름', value: '김서연' },
          { label: '회사', value: '(주)모라테크' },
          { label: '직책', value: '사업개발 이사' },
          { label: '전화', value: '010-9234-5678' },
          { label: '이메일', value: 'seoyeon@mora.kr' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '3',
    title: '언제든 검색하세요',
    desc: '"디자이너 김씨" 같이 기억나는 대로 검색하면 바로 찾아줍니다.',
    visual: (
      // 검색 바 + 검색 결과 목업
      <div style={{ width: 300, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
          <svg style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span style={{ fontSize: 14, color: 'rgba(255,138,61,0.6)' }}>디자이너 김씨</span>
        </div>
        {/* 검색 결과 카드 */}
        <div style={{ marginTop: 12, padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,138,61,0.15)', background: 'rgba(255,138,61,0.05)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>김서연</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>(주)모라테크 · 사업개발 이사</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>010-9234-5678</p>
        </div>
      </div>
    ),
  },
]

/**
 * StepBlock — 개별 단계 블록 컴포넌트
 * IntersectionObserver로 뷰포트 진입 시 페이드인 + 슬라이드업 애니메이션
 * 짝수/홀수 인덱스에 따라 비주얼과 텍스트의 좌우 배치가 교차됨
 */
function StepBlock({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

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
      { threshold: 0.15 }  // 15% 보이면 애니메이션 시작
    )
    // 초기 상태: 숨김 (투명 + 60px 아래)
    el.style.opacity = '0'
    el.style.transform = 'translateY(60px)'
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // 짝수 인덱스: 비주얼 왼쪽 / 홀수: 비주얼 오른쪽 (지그재그 배치)
  const isEven = index % 2 === 0

  return (
    <div
      ref={ref}
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isEven ? 'row' : 'row-reverse',  // 좌우 교차 배치
          alignItems: 'center',
          gap: 80,
          maxWidth: 1000,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* 시각적 요소 (일러스트/목업) */}
        <div style={{ flex: 1 }}>
          {step.visual}
        </div>

        {/* 텍스트 (번호 + 제목 + 설명) */}
        <div style={{ flex: 1, textAlign: isEven ? 'left' : 'right' }}>
          {/* 단계 번호 원형 뱃지 */}
          <div
            style={{
              display: 'inline-flex',
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(255,138,61,0.1)',
              fontSize: 16,
              fontWeight: 700,
              color: '#FF8A3D',
            }}
          >
            {step.num}
          </div>
          <h3 style={{ marginTop: 24, fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
            {step.title}
          </h3>
          <p style={{ marginTop: 16, fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HowToSection() {
  const headerRef = useRef<HTMLDivElement>(null)

  // 헤더("3단계면 충분해요")도 IntersectionObserver로 페이드인
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.3 }
    )
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="how">
      {/* 섹션 헤더 */}
      <div
        ref={headerRef}
        style={{ padding: '120px 24px 40px', textAlign: 'center' }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: '#FF8A3D' }}>이렇게 간단합니다</p>
        <h2 style={{ marginTop: 16, fontSize: 42, fontWeight: 700, color: 'white' }}>
          3단계면 충분해요
        </h2>
      </div>

      {/* 각 단계 블록을 순서대로 렌더링 */}
      {STEPS.map((step, i) => (
        <StepBlock key={step.num} step={step} index={i} />
      ))}
    </section>
  )
}
