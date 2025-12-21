import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { DEPENDENCY_TOKENS } from "../../tokens.js";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { PasswordHasher } from "../contracts/password-hasher.js";
import type { CreateUserData, UserRepository } from "../ports/user-repository.js";

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignupOutput {}

export type SignupError =
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_INPUT"
  | "UNEXPECTED";

@injectable()
export class SignupUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.userRepository)
    private readonly userRepository: UserRepository,
    @inject(DEPENDENCY_TOKENS.passwordHasher)
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    input: SignupInput
  ): Promise<Result<SignupOutput, SignupError>> {
    const validation = signupUseCaseSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    try {
      const passwordHash = await this.passwordHasher.hash(
        validation.data.password
      );

      await this.userRepository.create(
        this.toCreateData(validation.data, passwordHash)
      );

      return ok({} satisfies SignupOutput);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return fail("EMAIL_ALREADY_EXISTS");
      }

      return fail("UNEXPECTED");
    }
  }

  private toCreateData(
    input: SignupInput,
    passwordHash: string
  ): CreateUserData {
    return {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      isActive: true,
      companyId: null,
    };
  }
}

const signupUseCaseSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1).max(20),
});

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
