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

export class GoGoConfig
{
	readonly taxonomy: any = null;
  readonly openHours: any = null;

  // APIs
	readonly elementApiUrl : string = '';
  readonly elementInBoundsApiUrl : string = '';
  readonly voteApiUrl : string = '';
  readonly reportApiUrl : string = '';
  readonly deleteApiUrl : string = '';
  readonly searchApiUrl : string = '';

  // Urls
  readonly editElementUrl : string = '';

  // login
  readonly userRole = '';
	readonly loginAction : () => void = function() {};

	constructor(config : any)
	{
    // Copy all the defined options
    // All the options non specified will be initialized with default values
    for(var prop in config) 
    {
        if (this.hasOwnProperty(prop))
        {
        	this[prop] = config[prop];
        }
        else
        {
        	console.warn("[GoGoCarto] Config option '" + prop + "' does not exist");
        }
    }
	}
}