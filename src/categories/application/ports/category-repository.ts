export interface CreateCategoryData {
  name: string;
  parentId?: string | null;
  companyId: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  parentId: string | null;
  companyId: string;
}

export interface CategoryRepository {
  create(data: CreateCategoryData): Promise<CategoryRecord>;
  findById(id: string): Promise<CategoryRecord | null>;
}
