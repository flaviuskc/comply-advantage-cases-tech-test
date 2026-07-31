export interface Case {
  identifier: string;
  assignee_id: string;
  status: string;
  name: string;
}

export type GetCasesResponse = {
  cases: Case[];
  total_count: number;
  first: string;
  next: string;
  prev: string;
  self: string;
};
