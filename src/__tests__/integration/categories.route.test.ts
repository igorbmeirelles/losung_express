import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/categories (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 201 on category creation", async () => {
    jest.spyOn(prisma.category, "findUnique").mockResolvedValue(null as any);
    jest.spyOn(prisma.category, "create").mockResolvedValue({
      id: "cat-1",
      name: "Category",
      parentId: null,
      companyId: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "COMPANY_OWNER", branchId: null }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Category" });

    expect(response.status).toBe(201);
    expect(response.body.categoryId).toBe("cat-1");
    expect(prisma.category.create).toHaveBeenCalled();
  });
});
