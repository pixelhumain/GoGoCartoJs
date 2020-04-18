import { AppModule, AppStates, AppDataType, AppModes } from '../app.module';

import { App } from '../gogocarto';

declare let routie: any, $;

export class LoginModule {
  private roles_: string[];
  private userEmail = '';

  constructor($roles: string[] | string, $userEmail = '') {
    this.setRoles($roles);
    this.setUserEmail($userEmail);
  }

  setRoles($roles: string[] | string) {
    if (typeof $roles == 'string') this.roles_ = [$roles];
    else this.roles_ = $roles;
  }

  setUserEmail(userEmail) {
    this.userEmail = userEmail;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getRoles() {
    return this.roles_;
  }

  loginAction() {
    if (typeof App.config.security.loginAction == 'function') App.config.security.loginAction();
    else eval(App.config.security.loginAction);
  }
}
