import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";

import { App } from "../gogocarto";

declare var routie: any, $;

export class LoginModule
{
	private roles_ : string[];
	private userEmail : string = '';

	constructor($roles : string[] | string, $userEmail : string = '') 
	{ 
		this.setRoles($roles); 
		this.setUserEmail($userEmail);
	}

	setRoles($roles : string[] | string)
	{ 
		if (typeof $roles == 'string') this.roles_ = [$roles];	
		else this.roles_ = $roles;
	}

	setUserEmail(userEmail) { this.userEmail = userEmail; }

	getUserEmail() { return this.userEmail; }

	getRoles() { return this.roles_; }

  loginAction() { App.config.security.loginAction(); }
}