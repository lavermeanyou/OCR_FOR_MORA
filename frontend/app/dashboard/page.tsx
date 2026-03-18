// ═══════════════════════════════════════════════════════════════
// dashboard/page.tsx — 대시보드 인덱스 페이지 (리다이렉트 전용)
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// /dashboard 경로에 접속하면 자동으로 /dashboard/upload 페이지로 리다이렉트한다.
// 대시보드 자체에는 별도 UI가 없고, 업로드 페이지가 기본 화면이다.
//
// [코드 흐름]
// 1) 사용자가 /dashboard에 접속
// 2) Next.js의 redirect() 함수가 서버 사이드에서 즉시 /dashboard/upload로 리다이렉트
//
// [컴포넌트/함수 목록]
// - DashboardPage(): 서버 컴포넌트로, redirect()를 호출하여 업로드 페이지로 이동
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// redirect() (next/navigation) — 서버 사이드에서 HTTP 리다이렉트를 수행하는 함수
// ───────────────────────────────────────────

import { redirect } from 'next/navigation'

export default function DashboardPage() {
  redirect('/dashboard/upload')
}
