import { AppModule, AppStates } from "../app.module";

declare let App : AppModule;

export class RouterModule
{
	generate(routeName : string, options? : any, absoluteUrl? : boolean)
	{
		return 'test';
	}
}