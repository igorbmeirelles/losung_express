export const DEPENDENCY_TOKENS = {
  userRepository: "UserRepository",
  passwordHasher: "PasswordHasher",
  signupUseCase: "SignupUseCase",
  loginUseCase: "LoginUseCase",
  authService: "AuthService",
  sessionCache: "SessionCache",
} as const;

export type DependencyTokenKeys = keyof typeof DEPENDENCY_TOKENS;
