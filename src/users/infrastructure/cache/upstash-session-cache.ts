import { Redis } from "@upstash/redis";
import { injectable } from "tsyringe";
import { authEnvs, cacheEnvs } from "../../../globals/envs.js";
import type {
  SessionCache,
  SessionCacheEntry,
} from "../../application/contracts/session-cache.js";
import { calculateSessionTtlSeconds } from "./session-ttl.js";

@injectable()
export class UpstashSessionCache implements SessionCache {
  private readonly redis = new Redis({
    url: cacheEnvs.upstashRedisUrl,
    token: cacheEnvs.upstashRedisToken,
  });

  private readonly ttlSeconds = calculateSessionTtlSeconds(authEnvs.refreshExpiresIn);

  async saveSession(entry: SessionCacheEntry): Promise<void> {
    await this.redis.set(entry.sessionId, JSON.stringify(entry), {
      ex: this.ttlSeconds,
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(sessionId);
  }

  async getSession(sessionId: string): Promise<SessionCacheEntry | null> {
    const value = await this.redis.get<string>(sessionId);
    if (!value) return null;
    try {
      return JSON.parse(value) as SessionCacheEntry;
    } catch {
      return null;
    }
  }
}
