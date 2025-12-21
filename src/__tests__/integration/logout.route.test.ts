import { describe, expect, it, jest } from "@jest/globals";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";
import { container } from "../../container.js";
import type { SessionCache } from "../../users/application/contracts/session-cache.js";
import { DEPENDENCY_TOKENS } from "../../users/tokens.js";
import { InMemorySessionCache } from "../../users/infrastructure/cache/in-memory-session-cache.js";

const baseUser = {
  id: "user-logout",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.logout@example.com",
  password: "password123",
  isActive: true,
  companyId: "company-logout",
  memberships: [
    { role: "SELLER", branchId: "branch-1" },
    { role: "SELLER", branchId: "branch-2" },
  ],
};

describe("/logout (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    if (sessionCache instanceof InMemorySessionCache) {
      sessionCache.clear();
    }
  });

  it("should return HTTP 204 and remove session cache entry", async () => {
    const hashed = await argon2.hash(baseUser.password);
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: baseUser.id,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
      email: baseUser.email,
      password: hashed,
      isActive: true,
      companyId: baseUser.companyId,
      BoardMembers: [
        {
          id: "bm1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: baseUser.id,
          companyId: baseUser.companyId,
          branchId: "branch-1",
          MembershipRole: [{ id: BigInt(1), role: "SELLER", boardMemberId: "bm1" }],
        },
        {
          id: "bm2",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: baseUser.id,
          companyId: baseUser.companyId,
          branchId: "branch-2",
          MembershipRole: [{ id: BigInt(2), role: "SELLER", boardMemberId: "bm2" }],
        },
      ],
    } as any);

    const loginResponse = await request(app).post("/login").send({
      email: baseUser.email,
      password: baseUser.password,
    });

    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    const { sid } = jwt.verify(loginResponse.body.refreshToken, authEnvs.jwtSecret) as any;
    expect(sid).toBeDefined();
    if (sessionCache instanceof InMemorySessionCache) {
      expect(sessionCache.get(sid)).toBeDefined();
    }

    const logoutResponse = await request(app).post("/logout").send({
      refreshToken: loginResponse.body.refreshToken,
    });

    expect(logoutResponse.status).toBe(204);
    if (sessionCache instanceof InMemorySessionCache) {
      expect(sessionCache.get(sid)).toBeUndefined();
    }
  });

  it("should return HTTP 401 when refresh token is invalid", async () => {
    const response = await request(app).post("/logout").send({
      refreshToken: "invalid.token",
    });

    expect(response.status).toBe(401);
  });
});
