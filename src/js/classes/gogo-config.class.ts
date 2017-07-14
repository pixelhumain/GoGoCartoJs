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
  roles : string[] = ['anonymous', 'user', 'admin'];
}

export class GoGoConfig
{
  readonly data =
  {
      taxonomy: null,
      elementApiUrl: '',
      elementInBoundsApiUrl: '',
  };
  readonly features =
  {
      favorite:   new GoGoFeature(),
      share:      new GoGoFeature(),
      directions: new GoGoFeature(),
      export:     new GoGoFeature(),
      layers:     new GoGoFeature(),
      edit:       new GoGoFeature(),
      report:     new GoGoFeature(),
      delete:     new GoGoFeature(),
      vote:       new GoGoFeature(),
      search:     new GoGoFeature(),
  };
  readonly security =
  {
      userRole: 'anonymous',
      loginAction: function() { console.warn("[GoGoCarto] You need login to access this feature"); }
  };  

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
          if (prop == 'roles' || typeof object[prop] != 'object')
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

  isFeatureAvailable(featureName) : boolean
  {
    if (!this.features.hasOwnProperty(featureName)) { console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`); return; }

    let feature = this.features[featureName];

    let roleProvided = true;
    if (feature.hasOwnProperty('roles'))
    {
      roleProvided = feature.roles.indexOf(App.loginModule.getStringifyRole()) >= 0;
    }

    return feature.active && roleProvided;
  }
}