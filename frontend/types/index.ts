// ═══════════════════════════════════════════════════════════════
// types/index.ts — 전역 타입 정의 파일
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 프론트엔드 전체에서 사용되는 공통 TypeScript 타입(인터페이스)을 정의한다.
// 명함 데이터 구조(BusinessCard)와 API 응답 형식(ApiResponse)을 표준화한다.
//
// [타입 목록]
// - BusinessCard: 명함 한 장의 데이터를 나타내는 인터페이스
//   - id?:         DB 저장 후 부여되는 고유 ID (저장 전에는 없음)
//   - name:        이름
//   - company:     회사명
//   - position:    직책
//   - phone:       전화번호
//   - email:       이메일
//   - raw_texts?:  OCR 원본 텍스트 블록 배열 (스캔 결과에만 포함)
//   - image_url?:  서버에 저장된 명함 이미지 경로
//   - created_at?: DB 저장 시각 (ISO 문자열)
//
// - ApiResponse<T>: API 응답의 성공/실패를 구분하는 유니온(판별) 타입
//   - 성공: { success: true, data: T }
//   - 실패: { success: false, error: string }
//   이 패턴을 사용하면 if(res.success) 체크 후 TypeScript가
//   자동으로 data 또는 error 타입을 추론해준다 (판별 유니온).

// 명함 데이터 인터페이스
export interface BusinessCard {
  id?: string           // DB 저장 후 부여되는 고유 식별자
  name: string          // 이름
  company: string       // 회사명
  position: string      // 직책
  phone: string         // 전화번호
  email: string         // 이메일 주소
  raw_texts?: string[]  // OCR이 추출한 원본 텍스트 블록들
  image_url?: string    // 서버에 저장된 명함 이미지 경로 (예: /uploads/xxx.jpg)
  created_at?: string   // 생성 시각 (ISO 8601 문자열)
}

// API 응답 타입 — 판별 유니온(discriminated union) 패턴
// success 필드의 true/false로 data와 error를 구분
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
