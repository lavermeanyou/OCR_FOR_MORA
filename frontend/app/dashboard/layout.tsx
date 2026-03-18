// ═══════════════════════════════════════════════════════════════
// dashboard/layout.tsx — 대시보드 레이아웃 (사이드바 + 콘텐츠 영역)
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// /dashboard 하위 모든 페이지에 공통 적용되는 레이아웃.
// 좌측 고정 사이드바(로고, 사용자 이름, 내비게이션, 로그아웃)와
// 우측 메인 콘텐츠 영역으로 구성된다.
// 로그인하지 않은 사용자는 /login으로 리다이렉트한다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 useEffect에서 localStorage의 mora_token 존재 여부 확인
// 2) 토큰 없으면 router.replace('/login')으로 리다이렉트
// 3) 토큰 있으면 mora_user에서 사용자 이름을 파싱하여 사이드바에 표시
// 4) checked=true로 설정 → 실제 레이아웃(사이드바 + children) 렌더링
// 5) 사이드바의 NAV_ITEMS를 순회하며 현재 pathname과 비교 → 활성 탭 강조
// 6) 로그아웃 클릭 시 localStorage 토큰/유저 삭제 후 홈으로 이동
//
// [컴포넌트/함수 목록]
// - DashboardLayout(): 사이드바 + 메인 영역을 감싸는 레이아웃 컴포넌트
// - handleLogout():    localStorage 클리어 후 홈으로 리다이렉트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useState()           — checked(인증 완료 여부), userName(사용자 이름) 상태 관리
// useEffect()          — 마운트 시 localStorage에서 토큰/유저 정보 확인
// usePathname() (next) — 현재 URL 경로를 가져와 활성 내비게이션 항목 판별
// useRouter() (next)   — router.replace()로 프로그래밍 방식 페이지 이동
// Link (next)          — 클라이언트 사이드 내비게이션 (사이드바 메뉴 항목)
// localStorage         — mora_token(JWT), mora_user(사용자 정보) 읽기/삭제
// ───────────────────────────────────────────

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// 사이드바 내비게이션 항목 정의
const NAV_ITEMS = [
  { label: '업로드', href: '/dashboard/upload', icon: '↑' },
  { label: '내 명함', href: '/dashboard/cards', icon: '▦' },
  { label: '검색', href: '/dashboard/search', icon: '⌕' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()   // 현재 URL 경로 (예: /dashboard/upload)
  const router = useRouter()       // 프로그래밍 방식 라우팅용
  const [checked, setChecked] = useState(false)   // 인증 확인 완료 여부
  const [userName, setUserName] = useState('')     // 사이드바에 표시할 사용자 이름

  // 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('mora_token')
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트 (히스토리에 남지 않도록 replace 사용)
      router.replace('/login')
      return
    }
    // 저장된 사용자 정보에서 이름 추출
    const user = localStorage.getItem('mora_user')
    if (user) {
      try { setUserName(JSON.parse(user).name || '') } catch {}
    }
    setChecked(true)  // 인증 확인 완료 → 레이아웃 렌더링 허용
  }, [router])

  // 로그아웃 처리: 토큰과 사용자 정보를 삭제하고 홈으로 이동
  function handleLogout() {
    localStorage.removeItem('mora_token')
    localStorage.removeItem('mora_user')
    router.replace('/')
  }

  // 인증 확인 중에는 로딩 표시
  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1521' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B1521' }}>
      {/* 좌측 고정 사이드바 (너비 260px) */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, width: 260, height: '100vh',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: '#0a1018',
      }}>
        {/* MORA 로고 — 클릭하면 랜딩 페이지로 이동 */}
        <div style={{ height: 80, display: 'flex', alignItems: 'center', padding: '0 28px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-logo)', fontSize: 22, color: '#FF8A3D', textDecoration: 'none', letterSpacing: 3 }}>
            MORA
          </Link>
        </div>

        {/* 사용자 이름 표시 영역 */}
        {userName && (
          <div style={{ padding: '0 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{userName}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>환영합니다</p>
          </div>
        )}

        {/* 내비게이션 메뉴 — 현재 경로와 일치하는 항목은 주황색으로 강조 */}
        <nav style={{ flex: 1, padding: '20px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              // 현재 경로가 item.href와 정확히 같거나, 하위 경로인 경우 활성화
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    fontSize: 15, fontWeight: 500, textDecoration: 'none',
                    background: isActive ? 'rgba(255,138,61,0.1)' : 'transparent',
                    color: isActive ? '#FF8A3D' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 로그아웃 버튼 — 사이드바 하단에 고정 */}
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.25)',
              transition: 'all 0.2s',
            }}
          >
            ← 로그아웃
          </button>
        </div>
      </aside>

      {/* 우측 메인 콘텐츠 영역 — 사이드바 너비만큼 왼쪽 여백 확보 */}
      <main style={{ marginLeft: 260, flex: 1, padding: 48 }}>
        {children}
      </main>
    </div>
  )
}
