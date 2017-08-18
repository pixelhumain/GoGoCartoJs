import { Roles } from "../modules/login.module";
import { App } from "../gogocarto";

export enum ElementStatus 
{
  Deleted = -4,
  CollaborativeRefused = -3,
  AdminRefused = -2,    
  PendingModification = -1,
  PendingAdd = 0,
  AdminValidate = 1,
  CollaborativeValidate = 2
}

export class GoGoFeature
{
  active : boolean = true;
  url : string = '';
  roles : string[] = ['anonymous', 'anonymous_with_mail', 'user', 'admin'];
  inIframe : boolean = true;

  hasRole(role) { return this.roles.indexOf(role) >= 0; }
}

export class GoGoConfig
{
  readonly data =
  {
      taxonomy: '',
      elementApiUrl: '',
      elementInBoundsApiUrl: '',
      showPending: true,
  };
  readonly map =
  {
      // france
      defaultBounds : L.latLngBounds(L.latLng(52, 10), L.latLng(40, -5)),
      defaultCenter : L.latLng(46, 0),
  };
  readonly features =
  {
      favorite:   new GoGoFeature(),
      share:      new GoGoFeature(),
      directions: new GoGoFeature(),
      export:     new GoGoFeature(),
      layers:     new GoGoFeature(),
      pending:    new GoGoFeature(),
      search:     new GoGoFeature(),

      add:        new GoGoFeature(),
      edit:       new GoGoFeature(), 
           
      delete:     new GoGoFeature(),
      report:     new GoGoFeature(),      
      vote:       new GoGoFeature(),
      sendMail:   new GoGoFeature(),

      directModeration:        new GoGoFeature(),
      collaborativeModeration: new GoGoFeature(),
      
  };
  readonly security =
  {
      userRole: 'anonymous',
      loginAction: function() { console.warn("[GoGoCarto] You need login to access this feature"); },

      hideMailsByShowingSendMailButton: true,
  };
  // see gogo-styles for defaut values
  readonly colors =
  {
    neutralDark: undefined ,
    neutralDarkTransparent: undefined ,
    neutralSoftDark: undefined ,
    neutral: undefined ,
    neutralLight: undefined ,
    secondary: undefined ,
    primary: undefined ,
    background: undefined ,

    textColor: undefined ,
    disableColor: undefined ,
    listTitle: undefined ,
    listTitleBackBtn: undefined,
    listTitleBackground: undefined ,
    searchBar: undefined, 
    interactiveSection: undefined,

    mainFont: undefined ,
    titleFont: undefined ,
    taxonomyMainTitleFont: undefined ,     
  }

	constructor(config : any)
	{
    // Copy all the defined options
    // All the options non specified will be initialized with default values
    this.recursiveFillProperty(this, config);

    console.log(this);
	}

  recursiveFillProperty(that, object)
  {
    for(var prop in object) 
    {
        if (that.hasOwnProperty(prop))
        {
          if (prop == 'roles' || typeof that[prop] != 'object')
            that[prop] = object[prop];
          else            
            this.recursiveFillProperty(that[prop], object[prop]);
        }
        else
        {
          console.warn("[GoGoCarto] Config option '" + prop + "' does not exist");
        }
    }
  }

  isFeatureActivated(featureName) : boolean
  {
    if (!this.features.hasOwnProperty(featureName)) { console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`); return false; }

    return this.features[featureName].active && (!App.isIframe || this.features[featureName].inIframe);
  }

  // is feature is activated and the actual user is granted to use it
  isFeatureAvailable(featureName) : boolean
  {
    if (!this.features.hasOwnProperty(featureName)) { console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`); return false; }

    let feature = this.features[featureName];

    let roleProvided = true;
    if (feature.hasOwnProperty('roles'))
    {
      roleProvided = feature.hasRole(App.loginModule.getStringifyRole());
    }

    return this.isFeatureActivated(featureName) && roleProvided;
  }

  isFeatureNeedMailInput(featureName) : boolean
  {
    if (!this.features.hasOwnProperty(featureName)) { console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`); return false; }

    let feature = this.features[featureName];

    return App.loginModule.getRole() == Roles.Anonymous && feature.haseRole('anonymous_with_mail');
  }

  isFeatureOnlyForAdmin(featureName) : boolean
  {
    if (!this.features.hasOwnProperty(featureName)) { console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`); return false; }

    let feature = this.features[featureName];
    return feature.roles.length == 0 && feature.roles[0] == 'admin';
  }  
}