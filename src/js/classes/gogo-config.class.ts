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

export class TileLayer
{
  name : string = '';
  url : string = '';

  constructor(name : string, url : string) { this.name = name; this.url = url; }
}

export class GoGoConfig
{
  readonly text =
  {
      element: 'élément',
      elementDefinite: "l'élément",
      elementIndefinite: "un élément",
      elementPlural: 'éléments',
      collaborativeModeration: `<p>
          Lorsqu'un élément est ajouté ou modifié, la mise à jour des données n'est pas instantanée. L'élément va d'abords apparaître "grisé" sur la carte,
          et il sera alors possible à tous les utilisateurs logué de voter une et une seule fois pour cet élément. 
          Ce vote n'est pas une opinion, mais un partage de connaissance. 
          Si vous connaissez cet élément, ou savez que cet élément n'existe pas, alors votre savoir nous intéresse !
        </p> 
        <p>
          Au bout d'un certain nombre de votes, l'élément pourra alors être automatiquement validé ou refusé. 
          En cas de litige (des votes à la fois positifs et négatifs), un modérateur interviendra au plus vite. On compte sur vous!
        </p>`
  };
  readonly data =
  {
      taxonomy: '',
      elementApiUrl: '',
      elementInBoundsApiUrl: '',
      showPending: true,
  };
  readonly menu =
  {
    showCheckboxForMainOptions: false,
    showCheckboxForSubOptions: true,
  };
  readonly map =
  {
      // france
      defaultBounds : L.latLngBounds(L.latLng(52, 10), L.latLng(40, -5)),
      defaultCenter : L.latLng(46, 0),
      defaultTileLayer : 'cartodb',
      tileLayers : [
        new TileLayer('mapbox', 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ViYWxsb3QiLCJhIjoiY2l4MGtneGVjMDF0aDJ6cWNtdWFvc2Y3YSJ9.nIZr6G2t08etMzft_BHHUQ'),
        new TileLayer('mapboxlight', 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ViYWxsb3QiLCJhIjoiY2l4MGtneGVjMDF0aDJ6cWNtdWFvc2Y3YSJ9.nIZr6G2t08etMzft_BHHUQ'),
        new TileLayer('cartodb', 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'), 
        new TileLayer('hydda', 'https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png'), 
        new TileLayer('wikimedia', 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'), 
        new TileLayer('monochrome', 'https://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'), 
        new TileLayer('lyrk ', 'https://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey =982c82cc765f42cf950a57de0d891076'), 
        new TileLayer('osmfr', 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'),
        new TileLayer('stamen', 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png'),
        new TileLayer('stamenTerrain', 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'),    
        new TileLayer('stamenWaterColor', 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png'),    
        new TileLayer('openriver', 'https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png'),
        new TileLayer('thunderforest', 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png') ]
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
      userEmail: '',
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
    let objectsProperties = ['roles', 'defaultCenter', 'defaultBounds', 'tileLayers'];

    for(var prop in object) 
    {
        if (that.hasOwnProperty(prop))
        {
          if (typeof that[prop] != 'object' || objectsProperties.indexOf(prop) > -1)
          {
            let new_prop;
            switch(prop) {
              case 'defaultBounds' : new_prop = L.latLngBounds(object[prop]);break;
              case 'defaultCenter' : new_prop = L.latLng(object[prop]);break;
              default: new_prop = object[prop];break;
            }
            that[prop] = new_prop;
          }
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