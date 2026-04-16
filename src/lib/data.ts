import { ChecklistCategory } from "./types";

export const DEFAULT_CHECKLIST: ChecklistCategory[] = [
  {
    id: "venue",
    title: "예식장 & 웨딩홀",
    emoji: "🏛️",
    items: [
      { id: "venue-1", label: "예식장 투어 및 비교", checked: false },
      { id: "venue-2", label: "예식장 계약", checked: false },
      { id: "venue-3", label: "예식 날짜 확정", checked: false },
      { id: "venue-4", label: "식사 메뉴 선택", checked: false },
      { id: "venue-5", label: "좌석 배치 계획", checked: false },
    ],
  },
  {
    id: "dress",
    title: "드레스 & 예복",
    emoji: "👗",
    items: [
      { id: "dress-1", label: "웨딩드레스 샵 방문", checked: false },
      { id: "dress-2", label: "웨딩드레스 선택 및 피팅", checked: false },
      { id: "dress-3", label: "신랑 예복 선택", checked: false },
      { id: "dress-4", label: "속옷 & 웨딩슈즈 준비", checked: false },
      { id: "dress-5", label: "2부 드레스 준비", checked: false },
    ],
  },
  {
    id: "photo",
    title: "스튜디오 & 촬영",
    emoji: "📸",
    items: [
      { id: "photo-1", label: "웨딩 스튜디오 예약", checked: false },
      { id: "photo-2", label: "셀프 촬영 소품 준비", checked: false },
      { id: "photo-3", label: "야외 촬영 장소 선정", checked: false },
      { id: "photo-4", label: "웨딩 앨범 제작", checked: false },
      { id: "photo-5", label: "본식 촬영 스냅 작가 예약", checked: false },
    ],
  },
  {
    id: "makeup",
    title: "메이크업 & 헤어",
    emoji: "💄",
    items: [
      { id: "makeup-1", label: "메이크업 & 헤어 샵 선택", checked: false },
      { id: "makeup-2", label: "리허설 메이크업", checked: false },
      { id: "makeup-3", label: "피부 관리 시작", checked: false },
      { id: "makeup-4", label: "네일아트 예약", checked: false },
    ],
  },
  {
    id: "invitation",
    title: "청첩장 & 초대",
    emoji: "💌",
    items: [
      { id: "inv-1", label: "청첩장 디자인 선택", checked: false },
      { id: "inv-2", label: "하객 명단 작성", checked: false },
      { id: "inv-3", label: "청첩장 발송", checked: false },
      { id: "inv-4", label: "모바일 청첩장 제작", checked: false },
    ],
  },
  {
    id: "honeymoon",
    title: "신혼여행",
    emoji: "✈️",
    items: [
      { id: "honey-1", label: "여행지 선정", checked: false },
      { id: "honey-2", label: "항공권 예약", checked: false },
      { id: "honey-3", label: "숙소 예약", checked: false },
      { id: "honey-4", label: "여행자 보험 가입", checked: false },
      { id: "honey-5", label: "여권 유효기간 확인", checked: false },
    ],
  },
  {
    id: "ring",
    title: "예물 & 예단",
    emoji: "💍",
    items: [
      { id: "ring-1", label: "웨딩 반지 구매", checked: false },
      { id: "ring-2", label: "예물 준비 (시계, 목걸이 등)", checked: false },
      { id: "ring-3", label: "예단 준비", checked: false },
      { id: "ring-4", label: "함 준비 (함잡이 섭외)", checked: false },
    ],
  },
  {
    id: "house",
    title: "신혼집 준비",
    emoji: "🏠",
    items: [
      { id: "house-1", label: "신혼집 계약", checked: false },
      { id: "house-2", label: "인테리어 계획", checked: false },
      { id: "house-3", label: "가전제품 구매", checked: false },
      { id: "house-4", label: "가구 구매", checked: false },
      { id: "house-5", label: "이사 날짜 확정", checked: false },
    ],
  },
  {
    id: "ceremony",
    title: "예식 당일 준비",
    emoji: "🎊",
    items: [
      { id: "cere-1", label: "사회자 섭외", checked: false },
      { id: "cere-2", label: "축가 섭외", checked: false },
      { id: "cere-3", label: "축사 섭외", checked: false },
      { id: "cere-4", label: "웨딩카 예약", checked: false },
      { id: "cere-5", label: "부케 주문", checked: false },
      { id: "cere-6", label: "답례품 준비", checked: false },
    ],
  },
];
