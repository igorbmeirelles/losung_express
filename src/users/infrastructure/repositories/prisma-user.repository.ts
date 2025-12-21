import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
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
}
