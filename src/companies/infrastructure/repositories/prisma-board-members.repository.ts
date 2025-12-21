import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  BoardMemberRecord,
  BoardMembersRepository,
  CreateBoardMemberData,
} from "../../application/ports/board-members-repository.js";
import { CompanyRole } from "../../domain/company-role.enum.js";

@injectable()
export class PrismaBoardMembersRepository implements BoardMembersRepository {
  async create(data: CreateBoardMemberData): Promise<BoardMemberRecord> {
    const boardMember = await prisma.boardMembers.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        branchId: data.branchId,
        isActive: true,
        MembershipRole: {
          createMany: {
            data: data.roles.map((role) => ({
              role: role as CompanyRole,
            })),
          },
        },
      },
      include: {
        MembershipRole: true,
      },
    });

    return {
      id: boardMember.id,
      userId: boardMember.userId,
      companyId: boardMember.companyId,
      branchId: boardMember.branchId,
      roles: boardMember.MembershipRole.map((role) => role.role),
    };
  }
}
