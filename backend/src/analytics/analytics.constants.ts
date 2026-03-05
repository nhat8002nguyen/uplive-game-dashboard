export const VALID_EVENTS = [
  "match_start",
  "match_end",
  "purchase",
  "level_up",
  "login",
] as const;

export type AnalyticsEvent = (typeof VALID_EVENTS)[number];
