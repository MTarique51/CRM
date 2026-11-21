export type Role = "Admin" | "Manager" | "SalesExecutive";
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  team?: string;
};
