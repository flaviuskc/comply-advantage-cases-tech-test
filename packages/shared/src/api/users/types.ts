export interface User {
  identifier: string;
  name: string;
  active: boolean;
}

export type GetUsersResponse = User[];
