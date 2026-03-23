// ── Users ────────────────────────────────────────────
 
export interface UserDto {
  userId: number;
  username: string;
  isActive: boolean;
  roles: string[];
}
 
// ── Requests ──────────────────────────────────
 
export interface RequestDto {
  requestId: number;
  title: string;
  amount: number;
  status: string;
  createdBy: number;
  currentAssignedRole: string;
  createdDate: string;
}
 
export interface RequestDetailDto {
  requestId: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  createdBy: number;
  createdDate: string;
}
 
// ── Audit ──────────────────────────
 
export interface AuditLogDto {
  auditLogId: number;
  requestId: number;
  action: string;
  actionByUserId: number;
  actionByRole: string;
  actionDate: string;
  username?: string;
  comments?: string | null;
}
 
// ── Dashboard ──────────────────────────────────
 
export interface DashboardRequest {
  requestId: number;
  title: string;
  amount: number;
  status: string;
  createdDate: string;
}