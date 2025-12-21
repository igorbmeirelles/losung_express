export interface CreateBoardMemberData {
  userId: string;
  companyId: string;
  branchId: string;
  roles: string[];
}

export interface BoardMemberRecord {
  id: string;
  userId: string;
  companyId: string;
  branchId: string | null;
  roles: string[];
}

export interface BoardMembersRepository {
  create(data: CreateBoardMemberData): Promise<BoardMemberRecord>;
}
