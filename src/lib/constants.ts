export const DEFAULT_SEASON_INVESTMENT_BUDGET = 1_000_000;
export const PERFORMANCE_RATE_SMOOTHING_VISITORS = 40;
export const MAX_PAYOUT_RATE = 10;

export const STAGES = [
  "setup",
  "investment_open",
  "investment_closed",
  "results",
] as const;

export type SeasonStage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<SeasonStage, string> = {
  setup: "준비",
  investment_open: "투자 진행 중",
  investment_closed: "투자 마감",
  results: "결과 공개",
};

export const ROLE_LABELS = {
  admin: "관리자",
  student: "참가자",
} as const;
