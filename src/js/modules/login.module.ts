import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";

import { App } from "../gogocarto";

declare var routie: any, $;

export enum Roles 
{
	Anonymous = 0,
	User = 1,
	Admin = 2
}

export class LoginModule
{
	private role_ : Roles;

	constructor($role : Roles | string = Roles.Anonymous) { this.setRole($role); }

	isGranted($role : Roles) { return this.role_ >= $role; }

	isAdmin() { return this.isGranted(Roles.Admin); }

	isUserLogged() { return this.isGranted(Roles.User); }

	setRole($role : Roles | string)
	{ 
		if (typeof $role == 'string')
		{
			this.role_ = $role == 'admin' ? Roles.Admin : $role == 'user' ? Roles.User : Roles.Anonymous;
		}
		else
		{
			this.role_ = $role;
		}		
	}

	getRole() { return this.role_; }

	getStringifyRole() { return Roles[this.role_].toLowerCase(); }

  loginAction() { App.config.security.loginAction(); }
}