import { afterEach, describe, expect, it, jest } from "@jest/globals";
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
  id: "user-refresh",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.refresh@example.com",
  password: "password123",
  isActive: true,
  companyId: "company-1",
  memberships: [
    { role: "SELLER", branchId: "branch-1" },
    { role: "SELLER", branchId: "branch-2" },
  ],
};

describe("/login/refresh (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    if (sessionCache instanceof InMemorySessionCache) {
      sessionCache.clear();
    }
  });

  it("issues new tokens and rotates session when refresh token and cache entry are valid", async () => {
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
      ],
    } as any);

    const loginResponse = await request(app).post("/login").send({
      email: baseUser.email,
      password: baseUser.password,
    });

    const refreshResponse = await request(app)
      .post("/login/refresh")
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();

    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    if (sessionCache instanceof InMemorySessionCache) {
      const { sid: oldSid } = jwt.verify(
        loginResponse.body.refreshToken,
        authEnvs.jwtSecret
      ) as any;
      const { sid: newSid } = jwt.verify(
        refreshResponse.body.refreshToken,
        authEnvs.jwtSecret
      ) as any;

      expect(await sessionCache.getSession(oldSid)).toBeNull();
      const newEntry = await sessionCache.getSession(newSid);
      expect(newEntry?.refreshToken).toBe(refreshResponse.body.refreshToken);
      expect(newEntry?.accessToken).toBe(refreshResponse.body.accessToken);
    }
  });

  it("returns 401 when refresh token is invalid", async () => {
    const response = await request(app)
      .post("/login/refresh")
      .send({ refreshToken: "invalid" });

    expect(response.status).toBe(401);
  });
});
