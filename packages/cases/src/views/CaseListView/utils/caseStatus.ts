import { isReassignableCaseStatus } from "shared";

export interface CaseStatusConfig {
  label: string;
  badgeVariant: string;
}

const DEFAULT_STATUS_CONFIG: CaseStatusConfig = {
  label: "",
  badgeVariant: "neutral",
};

const CASE_STATUS_CONFIG: Record<string, CaseStatusConfig> = {
  CASE_NOT_STARTED: { label: "Not Started", badgeVariant: "neutral" },
  CASE_IN_PROGRESS: { label: "In Progress", badgeVariant: "info" },
  CASE_ON_HOLD: { label: "On Hold", badgeVariant: "warning" },
  CASE_RESOLVED_RISK_DETECTED: {
    label: "Resolved - Risk Detected",
    badgeVariant: "negative",
  },
  CASE_RESOLVED_NO_RISK_DETECTED: {
    label: "Resolved - No Risk Detected",
    badgeVariant: "positive",
  },
};

export const getCaseStatusConfig = (status: string): CaseStatusConfig =>
  CASE_STATUS_CONFIG[status] ?? { ...DEFAULT_STATUS_CONFIG, label: status };

export interface CaseStatusOption {
  status: string;
  label: string;
}

export const ALL_CASE_STATUSES: CaseStatusOption[] = Object.entries(
  CASE_STATUS_CONFIG,
).map(([status, config]) => ({ status, label: config.label }));

export const isReassignableStatus = isReassignableCaseStatus;
