export const DEPENDENCY_TOKENS = {
  userRepository: "UserRepository",
  passwordHasher: "PasswordHasher",
  signupUseCase: "SignupUseCase",
  loginUseCase: "LoginUseCase",
  authService: "AuthService",
  sessionCache: "SessionCache",
  logoutUseCase: "LogoutUseCase",
  hasCompanyUseCase: "HasCompanyUseCase",
  refreshLoginUseCase: "RefreshLoginUseCase",
} as const;

export type DependencyTokenKeys = keyof typeof DEPENDENCY_TOKENS;
