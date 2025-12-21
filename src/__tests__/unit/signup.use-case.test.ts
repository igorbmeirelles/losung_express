import { describe, expect, it, jest } from "@jest/globals";
import { SignupUseCase } from "../../users/application/use-cases/signup.use-case.js";
import type {
  CreateUserData,
  UserRecord,
  UserRepository,
} from "../../users/application/ports/user-repository.js";
import type { PasswordHasher } from "../../users/application/contracts/password-hasher.js";
import { PasswordHashService } from "../../users/infrastructure/security/password-hash.service.js";

class InMemoryUserRepository implements UserRepository {
  public createdUsers: UserRecord[] = [];
  public createMock: jest.MockedFunction<
    (data: CreateUserData) => Promise<UserRecord>
  > = jest.fn();
  async findByEmailWithAuth(): Promise<any> {
    throw new Error("not implemented");
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    this.createMock.mock.calls.length === 0 &&
      this.createMock.mockResolvedValue({
        id: "user-1",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.passwordHash,
        isActive: data.isActive,
        companyId: data.companyId ?? null,
      });

    const created = await this.createMock(data);
    this.createdUsers.push(created);
    return created;
  }
}

class StubPasswordHasher implements PasswordHasher {
  public hashMock: jest.MockedFunction<
    (password: string) => Promise<string>
  > = jest.fn();
  public verifyMock: jest.MockedFunction<
    (password: string, hash: string) => Promise<boolean>
  > = jest.fn();

  hash(password: string): Promise<string> {
    return this.hashMock(password);
  }

  verify(password: string, hash: string): Promise<boolean> {
    return this.verifyMock(password, hash);
  }
}

const baseInput = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "secret",
};

describe("SignupUseCase (unit)", () => {
  it("should create a user as active and return success", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed-secret");
    const useCase = new SignupUseCase(repo, hasher);

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
    expect(repo.createdUsers[0]?.isActive).toBe(true);
  });

  it("should hash password using Argon2 implementation", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new PasswordHashService();
    const useCase = new SignupUseCase(repo, hasher);

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
    expect(repo.createdUsers[0]?.password).toBeDefined();
    expect(repo.createdUsers[0]?.password).not.toBe(baseInput.password);
    expect(repo.createdUsers[0]?.password.startsWith("$argon2")).toBe(true);
  });

  it("should reject passwords longer than 20 characters", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new StubPasswordHasher();
    const useCase = new SignupUseCase(repo, hasher);

    const result = await useCase.execute({
      ...baseInput,
      password: "a".repeat(21),
    });

    expect(result).toEqual({ success: false, error: "INVALID_INPUT" });
    expect(hasher.hashMock).not.toHaveBeenCalled();
    expect(repo.createMock).not.toHaveBeenCalled();
  });

  it("should never persist plain-text passwords", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed-secret");
    const useCase = new SignupUseCase(repo, hasher);

    await useCase.execute(baseInput);

    expect(repo.createdUsers[0]?.password).toBe("hashed-secret");
    expect(repo.createdUsers[0]?.password).not.toBe(baseInput.password);
  });

  it("should return Result.Success on valid input", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed-secret");
    const useCase = new SignupUseCase(repo, hasher);

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
  });

  it("should return Result.Failure on invalid input", async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new StubPasswordHasher();
    const useCase = new SignupUseCase(repo, hasher);

    const result = await useCase.execute({
      ...baseInput,
      email: "invalid-email",
    });

    expect(result).toEqual({ success: false, error: "INVALID_INPUT" });
  });
});
