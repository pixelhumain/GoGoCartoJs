export class GoGoFeature
{
  active : boolean = true;
  url : string = '';
  roles : string[] = ['anonymous', 'anonymous_with_mail', 'user', 'admin'];
  inIframe : boolean = true;

  hasRole(role) { return this.roles.indexOf(role) >= 0; }
}