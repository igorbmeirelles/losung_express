import "express";

declare global {
  namespace Express {
    interface AuthenticatedUser {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      companyId?: string | null;
      roles?: string[];
      branchIds?: string[];
      memberships?: Array<{ role: string; branchId: string | null }>;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
