export class VoteReport {
  type: number;
  value: number;
  comment: string;
  userEmail: string;
  userRole: number;
  createdAt: string;

  constructor(voteReportJson: any) {
    this.type = voteReportJson.type;
    this.value = voteReportJson.value;
    this.comment = voteReportJson.comment;
    this.userEmail = voteReportJson.userEmail;
    this.userRole = voteReportJson.userRole;
    this.createdAt = voteReportJson.createdAt;
  }
}
