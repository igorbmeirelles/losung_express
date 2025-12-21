import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  AuthUser,
  BoardMembership,
  CreateUserData,
  UserRecord,
  UserRepository,
} from "../../application/ports/user-repository.js";

@injectable()
export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserData): Promise<UserRecord> {
    if (!data.passwordHash.startsWith("$argon2")) {
      throw new Error("Password must be hashed with Argon2 before persistence");
    }

    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.passwordHash,
        isActive: data.isActive,
        companyId: data.companyId ?? null,
      },
    });
  }

  async findByEmailWithAuth(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        BoardMembers: {
          where: { isActive: true },
          include: {
            MembershipRole: true,
          },
        },
      },
    });

    if (!user) return null;

    const memberships =
      user.BoardMembers.flatMap((membership) =>
        membership.MembershipRole.map((role) => ({
          role: role.role,
          branchId: membership.branchId ?? null,
        }))
      ) ?? [];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      companyId: user.companyId ?? null,
      memberships,
    };
  }

  async findBoardMemberships(userId: string): Promise<BoardMembership[]> {
    const boardMembers = await prisma.boardMembers.findMany({
      where: { userId, isActive: true },
      include: {
        MembershipRole: true,
      },
    });

    return boardMembers.flatMap((membership) =>
      membership.MembershipRole.map((role) => ({
        isActive: membership.isActive,
        role: role.role,
        branchId: membership.branchId ?? null,
        companyId: membership.companyId ?? null,
      }))
    );
  }
}
