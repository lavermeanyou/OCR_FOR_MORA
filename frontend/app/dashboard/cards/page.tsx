// ═══════════════════════════════════════════════════════════════
// dashboard/cards/page.tsx — 내 명함 목록 페이지
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 사용자가 스캔하고 저장한 명함들을 그리드 형태로 보여주고,
// 각 명함의 상세 보기(팝업), 수정(모달), 삭제 기능을 제공한다.
//
// [코드 흐름]
// 1) 컴포넌트 마운트 시 useEffect → load() 호출 → getMyCards() API로 명함 목록 조회
// 2) 카드 그리드로 명함 목록 렌더링 (2열 그리드, 이미지 + 기본 정보)
// 3) 카드 클릭 → setPopup(card) → 상세 보기 팝업 표시
// 4) 팝업에서 "수정" 클릭 → setEditing({...popup}) → 수정 모달 전환
// 5) 수정 모달에서 필드 변경 후 "저장" → handleUpdate()가 PUT 요청
// 6) 팝업에서 "삭제" 클릭 → handleDelete()가 confirm 후 DELETE 요청
//
// [컴포넌트/함수 목록]
// - CardsPage():     명함 목록 조회·표시·수정·삭제를 관리하는 페이지 컴포넌트
// - load():          getMyCards() API를 호출하여 명함 목록을 가져오는 함수
// - getToken():      localStorage에서 JWT 토큰을 읽어오는 유틸 함수
// - handleDelete():  confirm 확인 후 서버에 DELETE 요청을 보내 명함을 삭제
// - handleUpdate():  수정된 명함 데이터를 서버에 PUT 요청으로 업데이트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// useState()          — cards(명함 배열), loading, error, popup(상세 팝업), editing(수정 모달), saving 상태 관리
// useEffect()         — 마운트 시 명함 목록을 자동으로 불러오기
// getMyCards() (api)  — GET /api/cards 엔드포인트로 내 명함 목록 조회
// BusinessCard (type) — 명함 데이터 타입 (id, name, company, position, phone, email, image_url 등)
// fetch()             — DELETE /api/cards/:id (삭제), PUT /api/cards/:id (수정) 요청
// localStorage        — JWT 토큰을 읽어 Authorization 헤더에 포함
// confirm() (Web API) — 삭제 전 사용자 확인 대화상자
// ───────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
import { getMyCards } from '@/lib/api'
import type { BusinessCard } from '@/types'

// 백엔드 API URL과 이미지 서빙 URL (Python FastAPI 서버)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const IMAGE_BASE = 'http://localhost:8000'

export default function CardsPage() {
  const [cards, setCards] = useState<BusinessCard[]>([])           // 명함 목록 배열
  const [loading, setLoading] = useState(true)                     // 목록 로딩 중 여부
  const [error, setError] = useState<string | null>(null)          // 에러 메시지
  const [popup, setPopup] = useState<BusinessCard | null>(null)    // 상세 보기 팝업에 표시할 명함
  const [editing, setEditing] = useState<BusinessCard | null>(null) // 수정 모달에 표시할 명함
  const [saving, setSaving] = useState(false)                      // 수정 저장 중 여부

  // API에서 명함 목록을 조회하는 함수
  async function load() {
    setLoading(true)
    const res = await getMyCards()
    setLoading(false)
    if (res.success) setCards(res.data)
    else setError(res.error)
  }

  // 컴포넌트 마운트 시 명함 목록 로드
  useEffect(() => { load() }, [])

  // localStorage에서 JWT 토큰을 읽어오는 헬퍼 함수
  function getToken() { return localStorage.getItem('mora_token') || '' }

  // 명함 삭제 — confirm 확인 후 DELETE 요청
  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await fetch(`${API_BASE}/api/cards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      // 로컬 상태에서도 즉시 제거하여 UI 반영
      setCards(cards.filter(c => c.id !== id))
      setPopup(null)
    } catch { alert('삭제 실패') }
  }

  // 명함 수정 — PUT 요청으로 업데이트 후 목록 새로고침
  async function handleUpdate() {
    if (!editing?.id) return
    setSaving(true)
    try {
      await fetch(`${API_BASE}/api/cards/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(editing),
      })
      setSaving(false)
      setEditing(null)
      setPopup(null)
      load()  // 수정 후 목록을 서버에서 다시 불러옴
    } catch { setSaving(false); alert('수정 실패') }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>내 명함</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
        스캔하고 저장한 명함 목록입니다.
      </p>

      {/* 로딩 중 표시 */}
      {loading && <p style={{ marginTop: 40, color: 'rgba(255,255,255,0.3)' }}>불러오는 중...</p>}
      {/* 에러 표시 */}
      {error && <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14 }}>{error}</div>}

      {/* 명함이 없을 때 빈 상태 표시 */}
      {!loading && !error && cards.length === 0 && (
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 48, opacity: 0.15 }}>📇</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>아직 저장된 명함이 없습니다</p>
        </div>
      )}

      {/* ── 명함 카드 그리드 (2열) ── */}
      {cards.length > 0 && (
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => setPopup(card)}
              style={{
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
              }}
            >
              {/* 명함 이미지 (있는 경우에만) */}
              {card.imageUrl && (
                <img
                  src={`${IMAGE_BASE}${card.imageUrl}`}
                  alt={card.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                />
              )}
              {/* 명함 기본 정보 */}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{card.name || '-'}</h3>
                <p style={{ fontSize: 13, color: '#FF8A3D', marginTop: 2 }}>{card.position}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{card.company}</p>
                {card.phone && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>{card.phone}</p>}
                {card.email && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{card.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 상세 보기 팝업 (오버레이 모달) ── */}
      {popup && !editing && (
        <div
          onClick={() => setPopup(null)}  // 오버레이 클릭 시 팝업 닫기
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          {/* stopPropagation으로 모달 내부 클릭이 오버레이 닫기를 트리거하지 않도록 방지 */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, width: '100%', borderRadius: 20, background: '#0f1a28', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            {popup.imageUrl && (
              <img src={`${IMAGE_BASE}${popup.imageUrl}`} alt={popup.name} style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#0a0e14' }} />
            )}
            <div style={{ padding: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{popup.name}</h2>
              <p style={{ fontSize: 14, color: '#FF8A3D', marginTop: 4 }}>{popup.position}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{popup.company}</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {popup.phone && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>📞 {popup.phone}</p>}
                {popup.email && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>✉️ {popup.email}</p>}
              </div>
              {/* 수정/삭제/닫기 버튼 */}
              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button onClick={() => setEditing({ ...popup })} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>수정</button>
                <button onClick={() => handleDelete(popup.id!)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>삭제</button>
              </div>
              <button onClick={() => setPopup(null)} style={{
                width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 10, border: 'none',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer',
              }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 수정 모달 ── */}
      {editing && (
        <div
          onClick={() => setEditing(null)}  // 오버레이 클릭 시 모달 닫기
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: '100%', borderRadius: 20, background: '#0f1a28', border: '1px solid rgba(255,255,255,0.1)', padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 24 }}>명함 수정</h2>
            {/* 수정 가능한 필드들을 동적으로 렌더링 */}
            {[
              { label: '이름', key: 'name' as const },
              { label: '회사', key: 'company' as const },
              { label: '직책', key: 'position' as const },
              { label: '전화', key: 'phone' as const },
              { label: '이메일', key: 'email' as const },
            ].map((f) => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <span style={{ width: 56, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>{f.label}</span>
                <input
                  value={editing[f.key] ?? ''}
                  onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  style={{
                    flex: 1, padding: '12px 14px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                    fontSize: 14, color: 'white', outline: 'none',
                  }}
                />
              </div>
            ))}
            {/* 저장/취소 버튼 */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={handleUpdate} disabled={saving} style={{
                flex: 1, padding: '14px 0', borderRadius: 10, border: 'none',
                background: '#FF8A3D', color: 'white', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
              }}>{saving ? '저장 중...' : '저장'}</button>
              <button onClick={() => setEditing(null)} style={{
                flex: 1, padding: '14px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
              }}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
