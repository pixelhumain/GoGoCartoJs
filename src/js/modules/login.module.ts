import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";

import { App } from "../gogocarto";

declare var routie: any, $;

enum Roles 
{
	Anonymus = 0,
	Logged = 1,
	Admin = 2
}

export class LoginModule
{
	constructor(private role_ : string = '')
	{	
	}

	isGranted($role)
	{
		return this.role_ >= $role;
	}

	isAdmin() { return this.isGranted(Roles.Admin); }
	isUserLogged() { return this.isGranted(Roles.Logged); }

	setRole($role)
  {
      this.role_ = $role;
  }

  loginAction()
  {
  	App.config.loginAction();
  }
}