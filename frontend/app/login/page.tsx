// ═══════════════════════════════════════════════════════════════
// login/page.tsx — 로그인/회원가입 페이지
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 이메일+비밀번호 로그인/회원가입, Google·카카오 소셜 로그인을 처리하는 페이지.
// 좌측은 MORA 브랜딩 영역, 우측은 인증 폼 영역으로 2분할 레이아웃.
//
// [코드 흐름]
// 1) 사용자가 /login에 접속하면 기본 모드는 '로그인' 탭
// 2) 탭 클릭으로 login ↔ signup 모드 전환 가능
// 3) 폼 제출(handleSubmit) 시:
//    a) mode에 따라 /auth/signup 또는 /auth/login 엔드포인트에 POST 요청
//    b) 응답에서 JWT 토큰을 추출하여 localStorage에 저장 (mora_token, mora_user)
//    c) 성공 시 window.location.href로 /dashboard 이동
//    d) 실패 시 에러 메시지를 화면에 표시
// 4) 소셜 로그인은 <a> 태그로 백엔드 OAuth URL로 직접 리다이렉트
//
// [컴포넌트/함수 목록]
// - LoginPage(): 로그인/회원가입 전체 UI와 인증 로직을 담당하는 페이지 컴포넌트
// - handleSubmit(): 폼 제출 시 서버에 인증 요청을 보내고 토큰을 저장하는 비동기 함수
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useState()     — mode(login/signup), email, password, name, error, loading 상태 관리
// Link (next)    — 클라이언트 사이드 내비게이션 (홈으로 돌아가기)
// fetch()        — 백엔드 /auth/signup 또는 /auth/login 엔드포인트에 POST 요청
// localStorage   — JWT 토큰(mora_token)과 사용자 정보(mora_user) 영구 저장
// process.env.NEXT_PUBLIC_API_URL — 백엔드 API 베이스 URL (환경변수)
// ───────────────────────────────────────────

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  // mode: 'login' 또는 'signup' — 현재 탭 상태
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')            // 회원가입 시에만 사용
  const [error, setError] = useState('')           // 에러 메시지
  const [loading, setLoading] = useState(false)    // 요청 진행 중 여부

  // 백엔드 API 기본 URL (환경변수가 없으면 로컬 개발 서버 사용)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  // 폼 제출 핸들러: 로그인 또는 회원가입 요청
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()       // 기본 폼 제출(페이지 새로고침) 방지
    setError('')
    setLoading(true)

    // mode에 따라 엔드포인트와 요청 body가 달라짐
    const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login'
    const body = mode === 'signup'
      ? { email, password, name: name || email.split('@')[0] }  // 이름 미입력 시 이메일 앞부분 사용
      : { email, password }

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        // 서버가 에러를 반환한 경우
        setError(data.error || data.data?.error || '요청 실패')
        return
      }

      // Spring 백엔드 응답 구조: {success, data: {token, userId, email, name}}
      const authData = data.data || data
      const token = authData.token
      if (!token) { setError('토큰을 받지 못했습니다'); return }

      // JWT 토큰과 사용자 정보를 localStorage에 저장
      localStorage.setItem('mora_token', token)
      localStorage.setItem('mora_user', JSON.stringify({
        id: authData.userId,
        email: authData.email,
        name: authData.name,
      }))

      // 대시보드로 이동 (전체 페이지 리로드 방식 — 토큰이 확실히 반영되도록)
      window.location.href = '/dashboard'
    } catch {
      setError('서버에 연결할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0B1521' }}>

      {/* 왼쪽: 브랜딩 영역 — MORA 로고 + 3가지 핵심 가치 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        background: 'linear-gradient(135deg, #0f1f30 0%, #0B1521 50%, #111827 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontFamily: 'var(--font-logo)', fontSize: 64, color: '#FF8A3D', letterSpacing: 4 }}>
            MORA
          </h1>
        </Link>
        <p style={{ marginTop: 24, fontSize: 20, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6 }}>
          명함을 스캔하면
          <br />
          AI가 즉시 정리합니다
        </p>
        {/* 핵심 가치 3개를 아이콘과 함께 표시 */}
        <div style={{ marginTop: 48, display: 'flex', gap: 32 }}>
          {['찍으면 끝', '알아서 정리', '바로 검색'].map(t => (
            <div key={t} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,138,61,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8A3D' }} />
              </div>
              <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* 로그인/회원가입 탭 전환 버튼 */}
          <div style={{ display: 'flex', marginBottom: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <button
              onClick={() => { setMode('login'); setError('') }}
              style={{
                flex: 1, padding: '16px 0', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 600,
                background: mode === 'login' ? '#FF8A3D' : 'transparent',
                color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }}
            >
              로그인
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              style={{
                flex: 1, padding: '16px 0', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 600,
                background: mode === 'signup' ? '#FF8A3D' : 'transparent',
                color: mode === 'signup' ? 'white' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }}
            >
              회원가입
            </button>
          </div>

          {/* 이메일/비밀번호 입력 폼 */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 회원가입 모드에서만 이름 입력 필드 표시 */}
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '18px 20px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                    fontSize: 15, color: 'white', outline: 'none',
                  }}
                />
              )}
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '18px 20px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                  fontSize: 15, color: 'white', outline: 'none',
                }}
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '18px 20px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                  fontSize: 15, color: 'white', outline: 'none',
                }}
              />

              {/* 에러 메시지 표시 영역 */}
              {error && (
                <p style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, textAlign: 'center' }}>
                  {error}
                </p>
              )}

              {/* 제출 버튼 — loading 중에는 비활성화 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '18px 0', borderRadius: 14, border: 'none',
                  background: '#FF8A3D', color: 'white', fontSize: 16, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                  marginTop: 8, transition: 'all 0.2s',
                }}
              >
                {loading ? '처리 중...' : mode === 'signup' ? '회원가입' : '로그인'}
              </button>
            </div>
          </form>

          {/* "또는" 구분선 */}
          <div style={{ position: 'relative', margin: '40px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ background: '#0B1521', padding: '0 20px', fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>또는</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 — <a>태그로 백엔드 OAuth URL에 직접 리다이렉트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Google OAuth 로그인 */}
            <a
              href={`${API}/auth/google/login`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '16px 0', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
                fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </a>
            {/* 카카오 OAuth 로그인 */}
            <a
              href={`${API}/auth/kakao/login`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '16px 0', borderRadius: 14, border: 'none',
                background: '#FEE500', fontSize: 15, fontWeight: 600, color: '#3C1E1E',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#3C1E1E" d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.76 5.01 4.41 6.35l-1.12 4.15 4.82-3.18c.62.08 1.24.13 1.89.13 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
              </svg>
              카카오로 계속하기
            </a>
          </div>

          {/* 홈으로 돌아가기 링크 */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
              ← 홈으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
