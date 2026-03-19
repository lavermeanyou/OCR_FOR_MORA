// ═══════════════════════════════════════════════════════════════
// dashboard/search/page.tsx — 명함 검색 페이지
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 사용자가 이름, 회사, 직책 등 키워드로 저장된 명함을 검색하고,
// 결과를 리스트 형태로 보여주며, 클릭하면 상세 팝업을 표시한다.
//
// [코드 흐름]
// 1) 사용자가 검색 input에 키워드 입력 후 "검색" 버튼 클릭 또는 Enter
// 2) handleSearch()가 searchCards() API 호출 → GET /api/search?q=키워드
// 3) 검색 결과가 있으면 리스트 형태로 표시 (이미지 썸네일 + 기본 정보 + 유사도%)
// 4) 결과 카드 클릭 → setPopup(card) → 상세 보기 팝업 표시
// 5) 결과가 없으면 "결과가 없습니다" 빈 상태 표시
//
// [컴포넌트/함수 목록]
// - SearchPage():    검색 폼 + 결과 리스트 + 상세 팝업을 관리하는 페이지 컴포넌트
// - handleSearch():  폼 제출 시 searchCards() API를 호출하여 검색 수행
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useState()            — query(검색어), results(결과 배열), isLoading, error, isSearched, popup 상태 관리
// searchCards() (api)   — GET /api/search?q= 엔드포인트로 검색 요청
// BusinessCard (type)   — 명함 데이터 타입
// encodeURIComponent()  — 검색어를 URL-safe 문자열로 인코딩 (api.ts 내부에서 사용)
// ───────────────────────────────────────────

'use client'

import { useState } from 'react'
import { searchCards } from '@/lib/api'
import type { BusinessCard } from '@/types'

// 이미지 서빙 URL
const IMAGE_BASE = 'http://localhost:8000'

export default function SearchPage() {
  const [query, setQuery] = useState('')                          // 검색 입력값
  const [results, setResults] = useState<BusinessCard[]>([])      // 검색 결과 배열
  const [isLoading, setIsLoading] = useState(false)                   // 검색 중 여부
  const [error, setError] = useState<string | null>(null)         // 에러 메시지
  const [isSearched, setIsSearched] = useState(false)                 // 한 번이라도 검색했는지 여부 (빈 결과 표시용)
  const [popup, setPopup] = useState<BusinessCard | null>(null)   // 상세 팝업에 표시할 명함

  // 폼 제출 시 검색 수행
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()                // 기본 폼 제출(페이지 새로고침) 방지
    if (!query.trim()) return         // 빈 검색어 무시
    setIsLoading(true)
    setError(null)
    setIsSearched(true)                 // 검색 시도 플래그 설정

    const res = await searchCards(query.trim())
    setIsLoading(false)
    if (res.success) setResults(res.data)
    else setError(res.error)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>검색</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
        이름, 회사, 직책 등 기억나는 대로 검색하세요.
      </p>

      {/* ── 검색 폼: input + 검색 버튼 ── */}
      <form onSubmit={handleSearch} style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 디자이너 김씨, 모라테크, 이사..."
          style={{
            flex: 1, padding: '16px 20px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            fontSize: 15, color: 'white', outline: 'none',
          }}
        />
        <button type="submit" disabled={isLoading} style={{
          padding: '16px 28px', borderRadius: 14, border: 'none',
          background: '#FF8A3D', color: 'white', fontSize: 15, fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1,
        }}>
          {isLoading ? '...' : '검색'}
        </button>
      </form>

      {/* 에러 표시 */}
      {error && (
        <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* 검색했으나 결과가 없을 때 빈 상태 표시 */}
      {isSearched && !isLoading && !error && results.length === 0 && (
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 48, opacity: 0.15 }}>🔍</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
            &quot;{query}&quot;에 대한 결과가 없습니다
          </p>
        </div>
      )}

      {/* ── 검색 결과 리스트 ── */}
      {results.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
            {results.length}건의 결과
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((card) => (
              <div
                key={card.id}
                onClick={() => setPopup(card)}
                style={{
                  display: 'flex', gap: 20, padding: 20, borderRadius: 16, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                {/* 이미지 썸네일 또는 플레이스홀더 */}
                {card.imageUrl ? (
                  <img
                    src={`${IMAGE_BASE}${card.imageUrl}`}
                    alt={card.name}
                    style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 100, height: 70, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: 'rgba(255,255,255,0.1)',
                  }}>📇</div>
                )}

                {/* 명함 정보 + 유사도 표시 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{card.name || '-'}</h3>
                    {card.similarity !== undefined && (
                      <span style={{ fontSize: 11, color: '#FF8A3D', fontWeight: 600 }}>
                        {Math.round((card.similarity || 0) * 100)}% 일치
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#FF8A3D', marginTop: 2 }}>{card.position}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{card.company}</p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    {card.phone && <span>{card.phone}</span>}
                    {card.email && <span>{card.email}</span>}
                  </div>
                </div>

                {/* 화살표 아이콘 — 클릭 가능함을 시각적으로 안내 */}
                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.15)' }}>→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 명함 상세 팝업 ── */}
      {popup && (
        <div
          onClick={() => setPopup(null)}  // 오버레이 클릭 시 팝업 닫기
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: 500, width: '100%', borderRadius: 20,
            background: '#0f1a28', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            {popup.imageUrl && (
              <img src={`${IMAGE_BASE}${popup.imageUrl}`} alt={popup.name}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#0a0e14' }} />
            )}
            <div style={{ padding: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{popup.name}</h2>
              <p style={{ fontSize: 14, color: '#FF8A3D', marginTop: 4 }}>{popup.position}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{popup.company}</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {popup.phone && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>📞 {popup.phone}</p>}
                {popup.email && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>✉️ {popup.email}</p>}
              </div>
              <button onClick={() => setPopup(null)} style={{
                width: '100%', marginTop: 24, padding: '14px 0', borderRadius: 12, border: 'none',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
              }}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
