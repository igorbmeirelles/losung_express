import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { BranchQuery } from "../ports/branch-query.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";

export interface ListBranchesInput {
  branchIds: string[];
}

export interface ListBranchesOutput {
  branches: Array<{
    id: string;
    name: string;
    phone: string;
    companyId: string;
  }>;
}

export type ListBranchesError = "INVALID_INPUT" | "UNEXPECTED";

@injectable()
export class ListBranchesUseCase {
  constructor(
    @inject(COMPANY_DEPENDENCY_TOKENS.branchQuery)
    private readonly branchQuery: BranchQuery
  ) {}

  async execute(
    input: ListBranchesInput
  ): Promise<Result<ListBranchesOutput, ListBranchesError>> {
    const validation = listBranchesSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    try {
      const branches = await this.branchQuery.findByIds(
        validation.data.branchIds
      );
      return ok({ branches });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }
}

const listBranchesSchema = z.object({
  branchIds: z.array(z.string().min(1)).min(1),
});
