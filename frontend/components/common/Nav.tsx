// ═══════════════════════════════════════════════════════════════
// components/common/Nav.tsx — 랜딩 페이지 상단 내비게이션 바
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 랜딩 페이지("/") 상단에 고정(fixed) 위치로 표시되는 내비게이션 바.
// 스크롤 시 배경이 투명에서 반투명 블러 효과로 전환된다.
// MORA 로고, 앵커 링크(사용법, 기능), 로그인/시작하기 버튼을 포함한다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 useEffect에서 window scroll 이벤트 리스너 등록
// 2) 스크롤 위치가 50px 초과 → scrolled=true → 배경색/블러/하단 테두리 활성화
// 3) 스크롤 위치가 50px 이하 → scrolled=false → 투명 배경으로 복원
// 4) 컴포넌트 언마운트 시 이벤트 리스너 정리 (메모리 누수 방지)
//
// [컴포넌트/함수 목록]
// - Nav(): 스크롤 반응형 상단 내비게이션 바 컴포넌트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useState()                   — scrolled(스크롤 상태) 관리
// useEffect()                  — 마운트 시 scroll 이벤트 리스너 등록/해제
// Link (next/link)             — /login으로의 클라이언트 사이드 내비게이션
// window.addEventListener()    — 스크롤 이벤트 감지 (passive: true로 성능 최적화)
// ───────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Nav() {
  // 스크롤 50px 초과 여부 — true이면 내비게이션 바에 배경색/블러 적용
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // passive: true → 스크롤 성능에 영향을 주지 않겠다고 브라우저에 알림
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)  // 클린업
  }, [])

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s',
        // 스크롤 시 반투명 배경 + 블러 효과 적용
        background: scrolled ? 'rgba(11,21,33,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        {/* MORA 로고 */}
        <a href="/" style={{ fontFamily: 'var(--font-logo)', fontSize: 24, color: '#FF8A3D', textDecoration: 'none', letterSpacing: 3 }}>
          MORA
        </a>

        {/* 앵커 링크 — 페이지 내 섹션으로 스크롤 이동 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#how" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>사용법</a>
          <a href="#feature" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>기능</a>
        </div>

        {/* 로그인 / 시작하기 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/login"
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            로그인
          </Link>
          <Link
            href="/login"
            style={{ padding: '10px 20px', borderRadius: 10, background: '#FF8A3D', fontSize: 14, fontWeight: 600, color: 'white', textDecoration: 'none' }}
          >
            시작하기
          </Link>
        </div>
      </div>
    </nav>
  )
}
