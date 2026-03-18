// ═══════════════════════════════════════════════════════════════
// components/landing/HeroSection.tsx — 히어로 섹션 (랜딩 페이지 첫 화면)
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 랜딩 페이지의 첫 번째 전체 화면(full-screen) 섹션.
// 좌측에 MORA 타이틀 + CTA 버튼, 우측에 마우스 반응형 3D 플로팅 명함 카드를 표시.
// 타이틀은 마운트 시 아래에서 위로 페이드인 애니메이션이 적용된다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 useEffect에서 타이틀(h1)에 페이드인 애니메이션 적용
// 2) 마우스 이동 시 handleMouseMove()가 섹션 내 마우스 좌표를 0~1 비율로 계산
// 3) mouse 좌표가 FloatingCard 컴포넌트에 전달되어 3D 틸트 효과 생성
// 4) CARDS 배열의 3장 명함이 각각 다른 위치·회전·z-index로 플로팅
// 5) CSS @keyframes로 각 카드가 부드럽게 떠다니는 애니메이션 적용
//
// [컴포넌트/함수 목록]
// - HeroSection():     히어로 영역 전체 (타이틀 + CTA + 플로팅 카드 + 스크롤 인디케이터)
// - FloatingCard():    마우스에 반응하여 3D 틸트되는 개별 명함 카드 컴포넌트
// - handleMouseMove(): 마우스 좌표를 0~1 비율로 변환하여 state에 저장
// - CARDS[]:           플로팅 카드에 표시할 3명의 샘플 명함 데이터 배열
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useRef()            — titleRef(h1 요소), sectionRef(section 요소)에 직접 접근
// useState()          — mouse 좌표(x, y) 상태 관리
// useCallback()       — handleMouseMove 함수 메모이제이션 (불필요한 재생성 방지)
// useEffect()         — 마운트 시 타이틀 페이드인 애니메이션 트리거
// Link (next/link)    — /login으로의 클라이언트 사이드 내비게이션
// requestAnimationFrame() — 다음 프레임에서 CSS transition 시작 (opacity/transform)
// style jsx (Next.js) — 컴포넌트 스코프 CSS (@keyframes 정의)
// ───────────────────────────────────────────

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// 플로팅 카드에 표시할 샘플 명함 데이터
const CARDS = [
  {
    name: '김서연',
    title: '사업개발 이사',
    company: '(주)모라테크놀로지',
    phone: '010-9234-5678',
    email: 'seoyeon.kim@moratech.co.kr',
    color: 'from-[#1a2a3f] to-[#0f1c2e]',
  },
  {
    name: '박준혁',
    title: 'AI Research Lead',
    company: 'NeuroVision Labs',
    phone: '010-3456-7890',
    email: 'junhyuk@neurovision.ai',
    color: 'from-[#1f2937] to-[#111827]',
  },
  {
    name: '이하은',
    title: 'Product Manager',
    company: '삼성SDS',
    phone: '010-1234-5678',
    email: 'haeun.lee@samsungsds.com',
    color: 'from-[#1c1f2e] to-[#12141f]',
  },
]

/**
 * FloatingCard — 마우스 좌표에 따라 3D 틸트되는 명함 카드
 * @param card   - 표시할 명함 데이터
 * @param index  - 카드 인덱스 (0,1,2) — 위치/회전/z-index 결정
 * @param mouseX - 섹션 내 마우스 X 비율 (0~1)
 * @param mouseY - 섹션 내 마우스 Y 비율 (0~1)
 */
function FloatingCard({
  card,
  index,
  mouseX,
  mouseY,
}: {
  card: (typeof CARDS)[number]
  index: number
  mouseX: number
  mouseY: number
}) {
  // 각 카드의 기본 위치, 회전, z-offset 값
  const offsets = [
    { x: -40, y: -30, rotate: -8, z: 30 },
    { x: 20, y: 10, rotate: 4, z: 15 },
    { x: -10, y: 50, rotate: -2, z: 0 },
  ]
  const o = offsets[index]
  // 마우스 위치(0~1)를 기준으로 틸트 각도 계산 (중심=0.5 기준)
  const tiltX = (mouseY - 0.5) * 10
  const tiltY = (mouseX - 0.5) * -10

  return (
    <div
      className="absolute transition-transform duration-700 ease-out"
      style={{
        transform: `
          translate(${o.x}px, ${o.y}px)
          perspective(1000px)
          rotateX(${tiltX + o.rotate * 0.5}deg)
          rotateY(${tiltY + o.rotate}deg)
          translateZ(${o.z}px)
        `,
        zIndex: 3 - index,  // 첫 번째 카드가 가장 앞에
        animation: `floatCard${index} ${6 + index}s ease-in-out infinite`,
        animationDelay: `${index * 0.5}s`,
      }}
    >
      {/* 명함 카드 UI — Tailwind 그라디언트 배경 + 반투명 테두리 */}
      <div
        className={`w-[300px] rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} p-6 shadow-2xl shadow-black/40 backdrop-blur-sm`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-6 rounded-md bg-[#FF8A3D]/20 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-[#FF8A3D]/60" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[3px] text-white/20">
            {card.company.length > 12 ? card.company.slice(0, 12) : card.company}
          </span>
        </div>
        <h4 className="text-lg font-bold text-white">{card.name}</h4>
        <p className="mt-0.5 text-xs font-medium text-[#FF8A3D]/70">{card.title}</p>
        <p className="mt-0.5 text-xs text-white/30">{card.company}</p>
        <div className="my-4 h-[1px] bg-white/5" />
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40">{card.phone}</p>
          <p className="text-[11px] text-white/40">{card.email}</p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)    // 타이틀(h1) 요소 참조
  const sectionRef = useRef<HTMLElement>(null)         // 섹션 요소 참조 (마우스 좌표 계산용)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })  // 마우스 비율 좌표

  // 마우스 이동 시 섹션 내 좌표를 0~1 비율로 변환
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  // 마운트 시 타이틀에 아래→위 페이드인 애니메이션 적용
  useEffect(() => {
    const el = titleRef.current
    if (el) {
      // 초기 상태: 투명 + 40px 아래
      el.style.opacity = '0'
      el.style.transform = 'translateY(40px)'
      // 다음 프레임에서 transition 시작하여 자연스러운 애니메이션 구현
      requestAnimationFrame(() => {
        el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      onMouseMove={handleMouseMove}
    >
      {/* 배경 그라디언트 — 어두운 남색 계열 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B1521] via-[#0f1f30] to-[#0B1521]" />

      {/* 중앙의 은은한 주황색 글로우 효과 */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF8A3D]/5 blur-[150px]" />

      {/* 메인 콘텐츠: 좌측 텍스트 + 우측 플로팅 카드 */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row lg:gap-20">
        {/* 좌측: 타이틀 + 설명 + CTA 버튼 */}
        <div ref={titleRef} className="flex-1 text-center lg:text-left">
          <h1 className="font-[var(--font-logo)] text-6xl leading-tight tracking-tight text-white md:text-8xl">
            MORA
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-white/50 lg:mx-0">
            명함을 스캔하면 AI가 즉시 정리합니다
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-[10px] bg-[#FF8A3D] px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#FF8A3D]/25"
            >
              <span className="relative z-10">시작하기</span>
              {/* hover 시 그라디언트 오버레이 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8A3D] to-[#FF6B1A] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <a
              href="#feature"
              className="rounded-[10px] border border-white/20 px-8 py-4 text-base font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              더 알아보기
            </a>
          </div>
        </div>

        {/* 우측: 3D 플로팅 명함 카드 (lg 브레이크포인트 이상에서만 표시) */}
        <div className="relative hidden h-[400px] w-[400px] flex-shrink-0 lg:block">
          {CARDS.map((card, i) => (
            <FloatingCard
              key={card.name}
              card={card}
              index={i}
              mouseX={mouse.x}
              mouseY={mouse.y}
            />
          ))}
        </div>
      </div>

      {/* 하단 스크롤 인디케이터 — "Scroll" 텍스트 + 펄스 애니메이션 라인 */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[4px] text-white/30">
          Scroll
        </span>
        <div className="h-10 w-[1px] animate-pulse bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      {/* 플로팅 카드 애니메이션 키프레임 정의 (컴포넌트 스코프 CSS) */}
      <style jsx>{`
        @keyframes floatCard0 {
          0%, 100% { transform: translate(-40px, -30px) perspective(1000px) rotateX(0deg) rotateY(-8deg) translateZ(30px); }
          50% { transform: translate(-40px, -45px) perspective(1000px) rotateX(2deg) rotateY(-6deg) translateZ(35px); }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translate(20px, 10px) perspective(1000px) rotateX(0deg) rotateY(4deg) translateZ(15px); }
          50% { transform: translate(20px, -5px) perspective(1000px) rotateX(-2deg) rotateY(6deg) translateZ(20px); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translate(-10px, 50px) perspective(1000px) rotateX(0deg) rotateY(-2deg) translateZ(0px); }
          50% { transform: translate(-10px, 35px) perspective(1000px) rotateX(1deg) rotateY(-4deg) translateZ(5px); }
        }
      `}</style>
    </section>
  )
}
