import { injectable } from "tsyringe";
import { authEnvs } from "../../../globals/envs.js";
import type {
  SessionCache,
  SessionCacheEntry,
} from "../../application/contracts/session-cache.js";
import { calculateSessionTtlSeconds } from "./session-ttl.js";

type StoredSession = SessionCacheEntry & { expiresAt: Date };

@injectable()
export class InMemorySessionCache implements SessionCache {
  private readonly sessions = new Map<string, StoredSession>();
  private readonly ttlSeconds = calculateSessionTtlSeconds(
    authEnvs.refreshExpiresIn
  );

  async saveSession(entry: SessionCacheEntry): Promise<void> {
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
    this.sessions.set(entry.sessionId, { ...entry, expiresAt });

    setTimeout(() => {
      this.sessions.delete(entry.sessionId);
    }, this.ttlSeconds * 1000).unref?.();
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getSession(sessionId: string): Promise<SessionCacheEntry | null> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return null;
    return {
      sessionId: entry.sessionId,
      userId: entry.userId,
      accessToken: entry.accessToken,
      refreshToken: entry.refreshToken,
    };
  }

  getTtlSeconds(): number {
    return this.ttlSeconds;
  }

  getExpiry(sessionId: string): Date | undefined {
    return this.sessions.get(sessionId)?.expiresAt;
  }

  clear(): void {
    this.sessions.clear();
  }
}
