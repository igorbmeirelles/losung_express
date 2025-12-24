export interface CategoryView {
  id: string;
  name: string;
  parentId: string | null;
  companyId: string;
}

export interface CategoryQuery {
  findByCompany(companyId: string): Promise<CategoryView[]>;
}
