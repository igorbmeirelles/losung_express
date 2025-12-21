export interface AuthService {
  signAccess(payload: Record<string, unknown>): Promise<string>;
  signRefresh(payload: Record<string, unknown>): Promise<string>;
  verifyRefresh(token: string): Promise<Record<string, unknown>>;
}
