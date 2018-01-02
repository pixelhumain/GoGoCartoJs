export class VoteReport 
{ 
	type : number;
	value : number;
	comment : string;
	userMail : string;
	userRole : number;
	createdAt : string;

	constructor(voteReportJson : any)
	{
		this.type = voteReportJson.type;
		this.value = voteReportJson.value;
		this.comment = voteReportJson.comment;
		this.userMail = voteReportJson.userMail;
		this.userRole = voteReportJson.userRole;
		this.createdAt = voteReportJson.createdAt;	
	}
}