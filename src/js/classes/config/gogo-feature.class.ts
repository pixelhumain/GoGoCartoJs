export class GoGoFeature
{
  active : boolean = false;
  url : string = '';
  roles : string[] = ['anonymous', 'anonymous_with_mail', 'user', 'admin'];
  inIframe : boolean = true;
  options : any = {};

  hasRole(roles : string[]) { 
    return this.roles.some( (role) => {
      return roles.indexOf(role) > -1;
    });
  }
}