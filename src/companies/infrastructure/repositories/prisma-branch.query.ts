import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type { BranchQuery, BranchView } from "../../application/ports/branch-query.js";

@injectable()
export class PrismaBranchQuery implements BranchQuery {
  async findByIds(branchIds: string[]): Promise<BranchView[]> {
    const branches = await prisma.branch.findMany({
      where: {
        id: { in: branchIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        companyId: true,
      },
    });

    return branches;
  }
}
