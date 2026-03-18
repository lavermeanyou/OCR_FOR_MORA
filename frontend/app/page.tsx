// ═══════════════════════════════════════════════════════════════
// page.tsx — 랜딩 페이지 (메인 홈, "/" 경로)
// ═══════════════════════════════════════════════════════════════
//
// [역할]
// 비로그인 사용자가 처음 접하는 랜딩(소개) 페이지.
// 상단 내비게이션 + 5개의 랜딩 섹션 + 푸터로 구성되며,
// 각 섹션은 별도 컴포넌트로 분리되어 있다.
//
// [코드 흐름]
// 1) 사용자가 "/" 에 접속하면 이 페이지가 렌더링됨
// 2) Nav(상단 고정 메뉴) → HeroSection(히어로 영역) → ProblemSection(문제 제기)
//    → HowToSection(사용법 3단계) → FeatureSection(기능 소개) → CTASection(행동 유도)
//    → FooterSection(푸터) 순서로 화면에 표시
// 3) 사용자가 스크롤하면서 각 섹션의 IntersectionObserver 애니메이션이 트리거됨
// 4) "시작하기" 버튼 클릭 시 /login 페이지로 이동
//
// [컴포넌트/함수 목록]
// - Home(): 랜딩 페이지 전체를 조합하는 메인 페이지 컴포넌트
//
// [사용된 라이브러리/훅]
// ───────────────────────────────────────────
// Nav            — 상단 고정 내비게이션 바 (로그인/시작하기 버튼 포함)
// HeroSection    — 메인 히어로 영역 (타이틀 + 플로팅 명함 카드)
// ProblemSection — "명함 어디에 뒀는지?" 문제 제기 섹션
// HowToSection   — 3단계 사용법 안내 섹션
// FeatureSection — 주요 기능 4가지 그리드 섹션
// CTASection     — 행동 유도(Call-To-Action) 섹션
// FooterSection  — 하단 푸터 (저작권, GitHub 링크)
// ───────────────────────────────────────────

import Nav from '@/components/common/Nav'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import HowToSection from '@/components/landing/HowToSection'
import FeatureSection from '@/components/landing/FeatureSection'
import CTASection from '@/components/landing/CTASection'
import FooterSection from '@/components/landing/FooterSection'

export default function Home() {
  return (
    <>
      {/* 상단 고정 내비게이션 */}
      <Nav />
      <main>
        {/* 히어로 영역: 타이틀 + 3D 명함 카드 애니메이션 */}
        <HeroSection />
        {/* 문제 제기: "명함 어디 뒀는지 기억나세요?" */}
        <ProblemSection />
        {/* 사용법: 촬영 → AI 정리 → 검색 3단계 */}
        <HowToSection />
        {/* 주요 기능 4가지 소개 */}
        <FeatureSection />
        {/* 행동 유도: "지금 시작하세요" */}
        <CTASection />
      </main>
      {/* 하단 푸터 */}
      <FooterSection />
    </>
  )
}
