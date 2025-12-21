export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  companyId?: string | null;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  companyId: string | null;
}

export interface UserRepository {
  create(data: CreateUserData): Promise<UserRecord>;
  findByEmailWithAuth(email: string): Promise<AuthUser | null>;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  companyId: string | null;
  memberships: Array<{
    role: string;
    branchId: string | null;
  }>;
}
