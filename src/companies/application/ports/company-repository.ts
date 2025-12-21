export interface CreateCompanyData {
  name: string;
  tenantUrl?: string | null;
  isActive: boolean;
}

export interface CompanyRecord {
  id: string;
  name: string;
  tenantUrl: string | null;
  isActive: boolean;
}

export interface CompanyRepository {
  create(data: CreateCompanyData): Promise<CompanyRecord>;
}
