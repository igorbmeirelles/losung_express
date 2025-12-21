import "reflect-metadata";
import { container } from "tsyringe";
import { SignupUseCase } from "./users/application/use-cases/signup.use-case.js";
import { SignupController } from "./users/infrastructure/http/signup.controller.js";
import { PrismaUserRepository } from "./users/infrastructure/repositories/prisma-user.repository.js";
import { PasswordHashService } from "./users/infrastructure/security/password-hash.service.js";
import { JwtAuthService } from "./users/infrastructure/security/jwt-auth.service.js";
import { LoginUseCase } from "./users/application/use-cases/login.use-case.js";
import { LoginController } from "./users/infrastructure/http/login.controller.js";
import { DEPENDENCY_TOKENS } from "./users/tokens.js";

container.registerSingleton(DEPENDENCY_TOKENS.userRepository, PrismaUserRepository);
container.registerSingleton(DEPENDENCY_TOKENS.passwordHasher, PasswordHashService);
container.registerSingleton(DEPENDENCY_TOKENS.signupUseCase, SignupUseCase);
container.registerSingleton(SignupController, SignupController);
container.registerSingleton(DEPENDENCY_TOKENS.authService, JwtAuthService);
container.registerSingleton(DEPENDENCY_TOKENS.loginUseCase, LoginUseCase);
container.registerSingleton(LoginController, LoginController);

export { container };
