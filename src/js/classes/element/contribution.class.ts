export class Contribution {
  type: number;
  status: number;
  user: string;
  userRole: number;
  resolvedMessage: string;
  resolvedBy: string;
  updatedAt: string;
  createdAt: string;

  constructor(contributionJson: any) {
    this.type = contributionJson.type;
    this.status = contributionJson.status;
    this.user = contributionJson.user;
    this.userRole = contributionJson.userRole;
    this.resolvedMessage = contributionJson.resolvedMessage;
    this.resolvedBy = contributionJson.resolvedBy;
    this.updatedAt = contributionJson.updatedAt;
    this.createdAt = contributionJson.createdAt;
  }
}
