export interface SessionCacheEntry {
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface SessionCache {
  saveSession(entry: SessionCacheEntry): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}
