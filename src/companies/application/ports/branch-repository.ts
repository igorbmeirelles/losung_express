export interface CreateBranchData {
  companyId: string;
  name: string;
  phone: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    country: string;
    zipCode: string;
    number: string;
    complement?: string | null;
  };
}

export interface BranchRecord {
  id: string;
  name: string;
  phone: string;
  companyId: string;
}

export interface BranchRepository {
  create(data: CreateBranchData): Promise<BranchRecord>;
}
