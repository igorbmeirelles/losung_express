import { describe, expect, it, jest } from "@jest/globals";
import { ListBranchesUseCase } from "../../companies/application/use-cases/list-branches.use-case.js";
import type { BranchQuery } from "../../companies/application/ports/branch-query.js";

class StubBranchQuery implements BranchQuery {
  constructor(private branches: any[]) {}
  async findByIds(branchIds: string[]) {
    return this.branches.filter((b) => branchIds.includes(b.id));
  }
}

describe("ListBranchesUseCase (unit)", () => {
  it("returns only branches present in the provided ids", async () => {
    const query = new StubBranchQuery([
      { id: "b1", name: "A", phone: "1", companyId: "c1" },
      { id: "b2", name: "B", phone: "2", companyId: "c1" },
    ]);
    const useCase = new ListBranchesUseCase(query);

    const result = await useCase.execute({ branchIds: ["b2"] });

    expect(result).toEqual({
      success: true,
      value: { branches: [{ id: "b2", name: "B", phone: "2", companyId: "c1" }] },
    });
  });

  it("returns invalid input when branchIds is empty", async () => {
    const query = new StubBranchQuery([]);
    const useCase = new ListBranchesUseCase(query);

    const result = await useCase.execute({ branchIds: [] });

    expect(result).toEqual({ success: false, error: "INVALID_INPUT" });
  });
});
