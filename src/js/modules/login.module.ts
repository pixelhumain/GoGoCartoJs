import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";

import { App } from "../gogocarto";

declare var routie: any, $;

export class LoginModule
{
	constructor(private role_ : string = '')
	{	
	}

	isGranted($role)
	{
		return this.role_ == $role;
	}

	private setRole($role)
  {
      this.role_ = $role;
  }

  loginAction()
  {
  	App.config.loginAction();
  }
}