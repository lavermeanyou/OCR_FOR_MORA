// ═══════════════════════════════════════════════════════════════
// lib/api.ts — 백엔드 API 통신 모듈
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 프론트엔드에서 백엔드(Spring Boot)와 통신하는 모든 API 함수를 모아둔 모듈.
// OCR 스캔, 명함 저장, 명함 목록 조회, 검색 기능을 제공한다.
// 모든 함수는 ApiResponse<T> 타입을 반환하여 성공/실패를 통일된 형식으로 처리한다.
//
// [코드 흐름]
// 1) 각 함수 호출 시 getAuthHeaders()로 JWT 토큰을 헤더에 포함
// 2) fetch()로 백엔드에 요청을 보내고 JSON 응답을 파싱
// 3) 성공이면 { success: true, data: ... }, 실패면 { success: false, error: '...' } 반환
// 4) 네트워크 오류 시 catch 블록에서 에러 메시지 반환
//
// [함수 목록]
// - getAuthHeaders(): localStorage에서 JWT 토큰을 읽어 Authorization 헤더 객체 생성
// - scanCard():       이미지 파일을 FormData로 보내 OCR 결과를 받아오는 함수
// - saveCard():       수정된 명함 데이터를 DB에 저장하는 함수
// - getMyCards():     현재 사용자의 명함 목록을 조회하는 함수
// - searchCards():    키워드로 명함을 검색하는 함수
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// fetch() (Web API)         — HTTP 요청 수행 (GET, POST)
// FormData (Web API)        — 파일 업로드를 위한 multipart/form-data 요청 본문 구성
// localStorage (Web API)    — JWT 토큰(mora_token) 저장소에서 읽기
// encodeURIComponent()      — 검색어를 URL-safe 문자열로 인코딩
// process.env.NEXT_PUBLIC_API_URL — 백엔드 API 기본 URL (빌드 시 주입되는 환경변수)
// ───────────────────────────────────────────

import type { BusinessCard, ApiResponse } from '@/types'

// 백엔드 API 기본 URL (환경변수가 없으면 로컬 개발 서버 사용)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/** 로컬 스토리지에서 JWT 토큰을 읽어 Authorization 헤더 객체를 생성 */
function getAuthHeaders(): Record<string, string> {
  // SSR 환경에서는 window가 없으므로 typeof 체크 필요
  const token = typeof window !== 'undefined' ? localStorage.getItem('mora_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Step 1: 이미지 파일을 서버에 보내 OCR만 수행 (아직 DB 저장 안 함) */
export async function scanCard(file: File): Promise<ApiResponse<BusinessCard>> {
  try {
    // FormData로 이미지 파일을 multipart/form-data 형식으로 전송
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeaders(),  // Content-Type은 FormData 사용 시 브라우저가 자동 설정
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || `서버 에러 (${res.status})` }
    }

    // Spring 백엔드가 Python OCR 응답을 한 번 더 감싸는 구조:
    // {success, data: {success, data: {parsed, raw_blocks}}}
    // 이 중첩 구조를 풀어서 필요한 데이터를 추출
    const inner = json.data?.data || json.data || {}
    const parsed = inner.parsed || json.data?.parsed || {}
    const raw = inner.raw_blocks || json.data?.raw_blocks || []

    return {
      success: true,
      data: {
        name: parsed.name || '',
        company: parsed.company || '',
        position: parsed.position || '',
        phone: parsed.phone || parsed.fax || '',  // fax를 phone 대체값으로 사용
        email: parsed.email || '',
        raw_texts: raw.map((b: { text: string }) => b.text),  // 원본 텍스트 블록 배열
        image_url: inner.image_url || json.data?.image_url || '',
      },
    }
  } catch {
    return { success: false, error: '백엔드 서버에 연결할 수 없습니다.' }
  }
}

/** Step 2: 사용자가 확인/수정한 명함 데이터를 DB에 저장 */
export async function saveCard(card: BusinessCard, imageUrl: string = ''): Promise<ApiResponse<{ id: string }>> {
  try {
    const res = await fetch(`${API_BASE}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ card, image_url: imageUrl }),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || `저장 실패 (${res.status})` }
    }
    return { success: true, data: json.data }
  } catch {
    return { success: false, error: '백엔드 서버에 연결할 수 없습니다.' }
  }
}

/** 내 명함 목록 조회 — GET /api/cards */
export async function getMyCards(): Promise<ApiResponse<BusinessCard[]>> {
  try {
    const res = await fetch(`${API_BASE}/api/cards`, { headers: getAuthHeaders() })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || `조회 실패 (${res.status})` }
    }
    return { success: true, data: json.data }
  } catch {
    return { success: false, error: '백엔드 서버에 연결할 수 없습니다.' }
  }
}

/** 키워드로 명함 검색 — GET /api/search?q=키워드 */
export async function searchCards(query: string): Promise<ApiResponse<BusinessCard[]>> {
  try {
    // 검색어를 URL 인코딩하여 쿼리 파라미터로 전달
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || `검색 실패 (${res.status})` }
    }
    // 검색 결과는 json.results 배열에 담겨옴
    return { success: true, data: json.results || [] }
  } catch {
    return { success: false, error: '백엔드 서버에 연결할 수 없습니다.' }
  }
}
