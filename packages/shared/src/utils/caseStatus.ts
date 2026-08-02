// Which case statuses are still "open" enough to be reassigned. Lives here
// (rather than in the `cases` package) because the mock API needs it too,
// to compute the "needs reassignment" filter server-side.
const REASSIGNABLE_CASE_STATUSES = new Set([
  'CASE_NOT_STARTED',
  'CASE_IN_PROGRESS',
  'CASE_ON_HOLD',
]);

export const isReassignableCaseStatus = (status: string): boolean =>
  REASSIGNABLE_CASE_STATUSES.has(status);
