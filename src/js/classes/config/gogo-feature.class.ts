export class GoGoFeature
{
  active : boolean = false;
  url : string = '';
  roles : string[] = ['anonymous', 'anonymous_with_mail', 'user', 'admin'];
  inIframe : boolean = true;

  hasRole(role) { return this.roles.indexOf(role) >= 0; }
}