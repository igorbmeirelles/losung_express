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
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  password: "password123",
  isActive: true,
  companyId: "company-1",
  memberships: [
    { role: "SELLER", branchId: "branch-1" },
    { role: "SELLER", branchId: "branch-2" },
  ],
};

describe("/login (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    if (sessionCache instanceof InMemorySessionCache) {
      sessionCache.clear();
    }
  });

  it("should return HTTP 200 on valid login and include JWT token", async () => {
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

    const response = await request(app).post("/login").send({
      email: baseUser.email,
      password: baseUser.password,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");

    const sessionCache = container.resolve<SessionCache>(
      DEPENDENCY_TOKENS.sessionCache
    );
    if (sessionCache instanceof InMemorySessionCache) {
      const { sid } = jwt.verify(response.body.refreshToken, authEnvs.jwtSecret) as any;
      const cached = sessionCache.get(sid);
      expect(cached?.userId).toBe(baseUser.id);
      expect(cached?.refreshToken).toBe(response.body.refreshToken);
      expect(cached?.accessToken).toBe(response.body.accessToken);
    }
  });

  it("JWT should contain userId, name, email, companyId, roles, branchIds", async () => {
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

    const response = await request(app).post("/login").send({
      email: baseUser.email,
      password: baseUser.password,
    });

    const payload = jwt.verify(response.body.accessToken, authEnvs.jwtSecret) as any;
    expect(payload).toMatchObject({
      userId: baseUser.id,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
      email: baseUser.email,
      companyId: baseUser.companyId,
    });
    expect(payload.memberships).toEqual(
      expect.arrayContaining(
        baseUser.memberships.map((m) => ({ role: m.role, branchId: m.branchId }))
      )
    );
  });

  it("should reject login with invalid password", async () => {
    const hashed = await argon2.hash(baseUser.password);
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: baseUser.id,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
      email: baseUser.email,
      password: hashed,
      isActive: true,
      companyId: baseUser.companyId,
      BoardMembers: [],
    } as any);

    const response = await request(app).post("/login").send({
      email: baseUser.email,
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });
});
