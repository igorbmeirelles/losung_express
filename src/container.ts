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
import { PrismaWarehouseRepository } from "./warehouses/infrastructure/repositories/prisma-warehouse.repository.js";
import { CreateWarehouseUseCase } from "./warehouses/application/use-cases/create-warehouse.use-case.js";
import { CreateWarehouseController } from "./warehouses/infrastructure/http/create-warehouse.controller.js";
import { PrismaBranchWarehouseRepository } from "./warehouses/infrastructure/repositories/prisma-branch-warehouse.repository.js";
import { AssociateWarehouseBranchUseCase } from "./warehouses/application/use-cases/associate-warehouse-branch.use-case.js";
import { AssociateWarehouseBranchController } from "./warehouses/infrastructure/http/associate-warehouse-branch.controller.js";
import { ListWarehousesUseCase } from "./warehouses/application/use-cases/list-warehouses.use-case.js";
import { PrismaWarehouseQuery } from "./warehouses/infrastructure/repositories/prisma-warehouse.query.js";
import { ListWarehousesController } from "./warehouses/infrastructure/http/list-warehouses.controller.js";
import { PrismaCategoryRepository } from "./categories/infrastructure/repositories/prisma-category.repository.js";
import { CreateCategoryUseCase } from "./categories/application/use-cases/create-category.use-case.js";
import { CreateCategoryController } from "./categories/infrastructure/http/create-category.controller.js";
import { ListCategoriesUseCase } from "./categories/application/use-cases/list-categories.use-case.js";
import { PrismaCategoryQuery } from "./categories/infrastructure/repositories/prisma-category.query.js";
import { ListCategoriesController } from "./categories/infrastructure/http/list-categories.controller.js";
import { COMPANY_DEPENDENCY_TOKENS } from "./companies/tokens.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "./warehouses/tokens.js";
import { CATEGORY_DEPENDENCY_TOKENS } from "./categories/tokens.js";
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
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.warehouseRepository,
  PrismaWarehouseRepository
);
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.createWarehouseUseCase,
  CreateWarehouseUseCase
);
container.registerSingleton(CreateWarehouseController, CreateWarehouseController);
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.branchWarehouseRepository,
  PrismaBranchWarehouseRepository
);
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.associateWarehouseBranchUseCase,
  AssociateWarehouseBranchUseCase
);
container.registerSingleton(
  AssociateWarehouseBranchController,
  AssociateWarehouseBranchController
);
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.listWarehousesUseCase,
  ListWarehousesUseCase
);
container.registerSingleton(
  WAREHOUSE_DEPENDENCY_TOKENS.warehouseQuery,
  PrismaWarehouseQuery
);
container.registerSingleton(ListWarehousesController, ListWarehousesController);
container.registerSingleton(
  CATEGORY_DEPENDENCY_TOKENS.categoryRepository,
  PrismaCategoryRepository
);
container.registerSingleton(
  CATEGORY_DEPENDENCY_TOKENS.createCategoryUseCase,
  CreateCategoryUseCase
);
container.registerSingleton(CreateCategoryController, CreateCategoryController);
container.registerSingleton(
  CATEGORY_DEPENDENCY_TOKENS.listCategoriesUseCase,
  ListCategoriesUseCase
);
container.registerSingleton(
  CATEGORY_DEPENDENCY_TOKENS.categoryQuery,
  PrismaCategoryQuery
);
container.registerSingleton(ListCategoriesController, ListCategoriesController);

export { container };
