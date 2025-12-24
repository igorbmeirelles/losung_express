export const CATEGORY_DEPENDENCY_TOKENS = {
  categoryRepository: "CategoryRepository",
  createCategoryUseCase: "CreateCategoryUseCase",
} as const;

export type CategoryDependencyKeys = keyof typeof CATEGORY_DEPENDENCY_TOKENS;
