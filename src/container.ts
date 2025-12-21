import "reflect-metadata";
import { container } from "tsyringe";
import { SignupUseCase } from "./users/application/use-cases/signup.use-case.js";
import { SignupController } from "./users/infrastructure/http/signup.controller.js";
import { PrismaUserRepository } from "./users/infrastructure/repositories/prisma-user.repository.js";
import { PasswordHashService } from "./users/infrastructure/security/password-hash.service.js";
import { JwtAuthService } from "./users/infrastructure/security/jwt-auth.service.js";
import { LoginUseCase } from "./users/application/use-cases/login.use-case.js";
import { LoginController } from "./users/infrastructure/http/login.controller.js";
import { InMemorySessionCache } from "./users/infrastructure/cache/in-memory-session-cache.js";
import { UpstashSessionCache } from "./users/infrastructure/cache/upstash-session-cache.js";
import { LogoutUseCase } from "./users/application/use-cases/logout.use-case.js";
import { LogoutController } from "./users/infrastructure/http/logout.controller.js";
import { HasCompanyUseCase } from "./users/application/use-cases/has-company.use-case.js";
import { HasCompanyController } from "./users/infrastructure/http/has-company.controller.js";
import { RefreshLoginUseCase } from "./users/application/use-cases/refresh-login.use-case.js";
import { RefreshLoginController } from "./users/infrastructure/http/refresh-login.controller.js";
import { PrismaCompanyRepository } from "./companies/infrastructure/repositories/prisma-company.repository.js";
import { PrismaBranchRepository } from "./companies/infrastructure/repositories/prisma-branch.repository.js";
import { PrismaBoardMembersRepository } from "./companies/infrastructure/repositories/prisma-board-members.repository.js";
import { CreateCompanyUseCase } from "./companies/application/use-cases/create-company.use-case.js";
import { CompanyController } from "./companies/infrastructure/http/company.controller.js";
import { ListBranchesUseCase } from "./companies/application/use-cases/list-branches.use-case.js";
import { PrismaBranchQuery } from "./companies/infrastructure/repositories/prisma-branch.query.js";
import { ListBranchesController } from "./companies/infrastructure/http/list-branches.controller.js";
import { CreateEmployeeUseCase } from "./companies/application/use-cases/create-employee.use-case.js";
import { CreateEmployeeController } from "./companies/infrastructure/http/create-employee.controller.js";
import { COMPANY_DEPENDENCY_TOKENS } from "./companies/tokens.js";
import { DEPENDENCY_TOKENS } from "./users/tokens.js";

container.registerSingleton(DEPENDENCY_TOKENS.userRepository, PrismaUserRepository);
container.registerSingleton(DEPENDENCY_TOKENS.passwordHasher, PasswordHashService);
container.registerSingleton(DEPENDENCY_TOKENS.signupUseCase, SignupUseCase);
container.registerSingleton(SignupController, SignupController);
container.registerSingleton(DEPENDENCY_TOKENS.authService, JwtAuthService);
container.registerSingleton(DEPENDENCY_TOKENS.loginUseCase, LoginUseCase);
container.registerSingleton(LoginController, LoginController);
container.registerSingleton(
  DEPENDENCY_TOKENS.sessionCache,
  process.env.NODE_ENV === "test" ? InMemorySessionCache : UpstashSessionCache
);
container.registerSingleton(DEPENDENCY_TOKENS.logoutUseCase, LogoutUseCase);
container.registerSingleton(LogoutController, LogoutController);
container.registerSingleton(DEPENDENCY_TOKENS.hasCompanyUseCase, HasCompanyUseCase);
container.registerSingleton(HasCompanyController, HasCompanyController);
container.registerSingleton(
  DEPENDENCY_TOKENS.refreshLoginUseCase,
  RefreshLoginUseCase
);
container.registerSingleton(RefreshLoginController, RefreshLoginController);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.companyRepository,
  PrismaCompanyRepository
);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.branchRepository,
  PrismaBranchRepository
);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.boardMembersRepository,
  PrismaBoardMembersRepository
);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.createCompanyUseCase,
  CreateCompanyUseCase
);
container.registerSingleton(CompanyController, CompanyController);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.listBranchesUseCase,
  ListBranchesUseCase
);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.branchQuery,
  PrismaBranchQuery
);
container.registerSingleton(ListBranchesController, ListBranchesController);
container.registerSingleton(
  COMPANY_DEPENDENCY_TOKENS.createEmployeeUseCase,
  CreateEmployeeUseCase
);
container.registerSingleton(CreateEmployeeController, CreateEmployeeController);

export { container };
