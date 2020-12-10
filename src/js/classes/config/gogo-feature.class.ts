export class GoGoFeature {
  active = false;
  url = '';
  roles: string[] = ['anonymous', 'user', 'admin'];
  inIframe = true;
  options: any = {};

  hasRole(roles: string[]) {
    return this.roles.some((role) => {
      return roles.indexOf(role) > -1;
    });
  }
}
