import { App } from '../../gogocarto';
import { TileLayer } from '../map/tile-layer.class';
import { GoGoFeature } from './gogo-feature.class';
import { MenuFilter } from '../classes';
import { DEFAULT_FEATURES } from './gogo-default-feature';
import { FR } from '../../../locales/fr';
import { EN } from '../../../locales/en';
declare let L: any, $, moment;
import * as tinycolor2 from 'tinycolor2';
const tinycolor = (<any>tinycolor2).default;

export class GoGoConfig {
  readonly mode = {
    autocompleteOnly: false, // we use gogocarto lib only to create the autoComplete search input
  };
  readonly data = {
    taxonomy: undefined,
    elements: undefined,
    elementsApiUrl: undefined,
    elementsCompactApiUrl: undefined,
    elementByIdUrl: undefined,
    requestByBounds: false,
    showPending: true,
  };
  readonly menu = {
    width: undefined,
    smallWidthStyle: false,
    showOnePanePerMainOption: false,
    showCheckboxForMainFilterPane: true,
    showCheckboxForSubFilterPane: true,
    displayNumberOfElementForEachCategory: false,
    displayNumberOfElementRoundResults: false,
    filters: [new MenuFilter({ type: 'taxonomy' })],
  };
  readonly infobar = {
    width: undefined,
    activate: true,
    bodyTemplate: {
      content: undefined,
      type: 'string', // string | url
      isMarkdown: true,
    },
    headerTemplate: {
      content: undefined,
      type: 'string', // string | url
      isMarkdown: true,
    },
    displayDateField: undefined, // name of the field who will provide the main element date
  };
  readonly marker = {
    displayPopup: true,
    popupAlwaysVisible: false,
    popupTemplate: {
      content: undefined,
      type: 'string', // string | url
      isMarkdown: true,
    },
  };
  readonly general = {
    activateHistoryStateAndRouting: true,
  };
  readonly map = {
    // france
    defaultBounds: L.latLngBounds(L.latLng(52, 10), L.latLng(40, -5)),
    defaultBoundsProvided: false,
    defaultCenter: L.latLng(46, 0),
    maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
    useClusters: true,
    saveViewportInCookies: false,
    saveTileLayerInCookies: false,
    defaultTileLayer: 'cartodb',
    tileLayers: [
      // new TileLayer('mapbox', 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ViYWxsb3QiLCJhIjoiY2l4MGtneGVjMDF0aDJ6cWNtdWFvc2Y3YSJ9.nIZr6G2t08etMzft_BHHUQ'),
      // new TileLayer('mapboxlight', 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ViYWxsb3QiLCJhIjoiY2l4MGtneGVjMDF0aDJ6cWNtdWFvc2Y3YSJ9.nIZr6G2t08etMzft_BHHUQ'),
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
      new TileLayer('thunderforest', 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'),
      new TileLayer('Pas de fond', ''),
    ],
    geojsonLayers: [],
  };
  readonly features = {
    // element menu
    favorite: new GoGoFeature(),
    share: new GoGoFeature(),
    directions: new GoGoFeature(),

    // element content
    sendMail: new GoGoFeature(),
    elementHistory: new GoGoFeature(),

    // gogo controls
    listMode: new GoGoFeature(),

    // map controls
    export: new GoGoFeature(),
    layers: new GoGoFeature(),
    mapdefaultview: new GoGoFeature(),

    pending: new GoGoFeature(),
    searchPlace: new GoGoFeature(),
    searchElements: new GoGoFeature(),
    searchCategories: new GoGoFeature(),
    searchGeolocate: new GoGoFeature(),

    // element interaction / moderation
    edit: new GoGoFeature(),
    delete: new GoGoFeature(),
    report: new GoGoFeature(),
    vote: new GoGoFeature(),
    moderation: new GoGoFeature(),
    stamp: new GoGoFeature(),
    directModeration: new GoGoFeature(),

    // others
    customPopup: new GoGoFeature(),
  };
  readonly security = {
    userRoles: ['anonymous'],
    userEmail: '',
    loginAction: function () {
      console.warn('[GoGoCarto] You need login to access this feature');
    },
  };
  public static readonly GEOCODING_PROVIDER_NOMINATIM = 'nominatim';
  public static readonly GEOCODING_PROVIDER_MAPBOX = 'mapbox';
  readonly search: {
    geocodingProvider: 'nominatim' | 'mapbox';
    canAutocomplete: boolean;
    meta: { apiKey?: string };
  } = {
    geocodingProvider: GoGoConfig.GEOCODING_PROVIDER_NOMINATIM,
    canAutocomplete: undefined,
    meta: { apiKey: '' },
  };
  theme = 'default';
  // see gogo-styles for defaut values
  readonly colors = {
    contentBackground: tinycolor('white'), // background color of text zone
    background: tinycolor('#f4f4f4'), // background color of non text zone

    // simple text and textSoft properties can be used, see this.fillColors
    textDark: tinycolor('#222120'), // text color on light background
    textDarkSoft: undefined, // soft text color on light background
    textLight: tinycolor('white'), // text color on dark background
    textLightSoft: undefined, // soft text color on dark background

    primary: tinycolor('#de5a5f'), // Used for buttons, and for search bar by default
    secondary: undefined, // Used by some themes (not default one). Equal primary by default

    infoBarHeader: undefined, // by default auto colored with main option color
    infoBarMenu: undefined, // by default auto colored with main option color

    contentBackgroundElementBody: undefined, // by default calculated from contentBackground
    menuOptionHover: undefined, // by default calculated from contentBackground
    lineBorder: undefined, // by default calculated from contentBackground
    disabled: undefined, // by default calculated from contentBackground
    searchBar: undefined, // by default primary
    interactiveSection: undefined, // by default primary
    mapControlsBgd: undefined,
    mapControls: undefined,
    mapListBtn: undefined,
    pending: tinycolor('#565656'),
  };
  readonly fonts = {
    mainFont: 'Roboto',
    titleFont: undefined, // by default titleFont
  };

  readonly images = {
    buttonOpenMenu: undefined,
    menuTopImage: undefined,
  };

  language = 'en'; // use 'test' to display the entry names

  readonly i18n = {
    en: EN,
    fr: FR,
  };

  constructor(config: any) {
    if (!config.features) {
      config.features = DEFAULT_FEATURES;
    }
    // Copy all the defined options
    // All the options non specified will be initialized with default values
    this.recursiveFillProperty(this, config);
    if (typeof this.data.elements == 'string') {
      this.data.elementsApiUrl = this.data.elements;
      this.data.elements = undefined;
    }
    if (config.map && config.map.defaultBounds) {
      this.map.defaultBoundsProvided = true;
    }
    if (!this.features['sendMail'].url) {
      this.features['sendMail'].active = false;
    }
    this.search.canAutocomplete = true;
    if (GoGoConfig.GEOCODING_PROVIDER_NOMINATIM === this.search.geocodingProvider) {
      this.search.canAutocomplete = false;
    }

    // COLORS
    if (!this.colors.menuOptionHover) {
      const menuOptionHover = tinycolor(this.colors.contentBackground.toString());
      this.colors.menuOptionHover = menuOptionHover.isDark() ? menuOptionHover.lighten(5) : menuOptionHover.darken(5);
    }
    if (!this.colors.contentBackgroundElementBody) {
      this.colors.contentBackgroundElementBody = this.colors.background; // tinycolor(this.colors.contentBackground.toString()).darken(3);
    }
    if (!this.colors.lineBorder) {
      const lineBorder = tinycolor(this.colors.contentBackground.toString()).greyscale();
      this.colors.lineBorder = lineBorder.isDark() ? lineBorder.lighten(15) : lineBorder.darken(15);
    }
    if (!this.colors.disabled) {
      const disabled = tinycolor(this.colors.contentBackground.toString()).greyscale();
      this.colors.disabled = disabled.isDark() ? disabled.lighten(35) : disabled.darken(35);
    }
    if (!this.colors.mapControlsBgd) {
      this.colors.mapControlsBgd = this.colors.contentBackground;
    }
    if (config.colors && !config.colors.text && !config.colors.textDark && !config.colors.textLight) {
      if (this.colors.contentBackground.isDark()) this.colors.textDark = this.colors.contentBackground;
      else this.colors.textLight = this.colors.contentBackground;
    }
    if (!this.colors.textLightSoft) {
      this.colors.textLightSoft = tinycolor(this.colors.textLight.toString()).darken(15);
    }
    if (!this.colors.textDarkSoft) {
      this.colors.textDarkSoft = tinycolor(this.colors.textDark.toString()).lighten(15);
    }
    if (!this.colors.mapListBtn) {
      this.colors.mapListBtn = tinycolor.readability(this.colors.primary, this.colors.mapControlsBgd)
        ? this.colors.primary
        : this.colors.mapControls;
    }
    if (this.theme == 'transiscope') {
      this.colors.infoBarHeader = this.colors.textDark;
      this.colors.infoBarMenu = this.colors.primary;
      this.colors.menuOptionHover = this.colors.contentBackground;
      if (!this.colors.interactiveSection) this.colors.interactiveSection = this.colors.secondary;
      if (!this.colors.searchBar) this.colors.searchBar = this.colors.textDark;
    }

    // TRANSLATIONS
    this.modifyTranslations(this, config.translations);

    // FEATURES
    if (!config.features) config.features = DEFAULT_FEATURES;

    // FILTERS
    for (let i = 0; i < this.menu.filters.length; i++) {
      const menu = <any>this.menu.filters[i];
      menu.id = i; // give an id to each filter
      // if there is a date filter, display the date-header in info bar & list
      if (menu.type == 'date' && this.infobar.displayDateField == undefined) this.infobar.displayDateField = menu.field;
    }

    // set Moment locale using the datepicker locales (which use same options name than moment...)
    let datepicker = $.fn.datepicker.dates[this.language]
    moment.locale(this.language, {
      months : datepicker.months,
      monthsShort : datepicker.monthsShort,
      weekdays : datepicker.days,
      weekdaysShort : datepicker.daysShort,
      weekdaysMin : datepicker.daysMin,
    })
    console.log(this);
  }

  // Function for i18n, mapping between the given entry and the string according to the language chosen
  translate(entry: string): string {
    if (!entry) return;
    if (this.language == 'test') return `i18n(${entry})`;
    let value = this.i18n[this.language] ? this.i18n[this.language][entry] : null;
    if (!value) {
      console.warn(`[GoGoCartoJS] Entry '${entry}' not found for language ${this.language}. Using english`);
      value = this.i18n['en'][entry];
    }
    if (value)
      value = value.replace(/\$\{([\w\.]+)\}/, (match, otherEntry) => this.translate(otherEntry));
    else {
      value = `MISSING TRANSLATION KEY : ${entry}`
      console.warn(`[GoGoCartoJS] Entry '${entry}' does not exist in english`);
    }

    return value;
  }

  isFeatureActivated(featureName): boolean {
    if (!this.features.hasOwnProperty(featureName)) {
      console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`);
      return false;
    }

    return this.features[featureName].active && (!App.isIframe || this.features[featureName].inIframe);
  }

  // is feature is activated and the actual user is granted to use it
  isFeatureAvailable(featureName: string): boolean {
    if (!this.features.hasOwnProperty(featureName)) {
      console.warn(`[GoGoCartoJs] feature ${featureName} doesn't exist`);
      return false;
    }

    const feature = this.features[featureName];

    let roleProvided = true;
    if (feature.hasOwnProperty('roles')) {
      roleProvided = feature.hasRole(App.loginModule.getRoles());
    }

    return this.isFeatureActivated(featureName) && roleProvided;
  }

  private recursiveFillProperty(gogoConfig, userConfig) {
    // we don't want to apply recursively inside objects properties
    const objectsProperties = [
      'roles',
      'defaultCenter',
      'defaultBounds',
      'tileLayers',
      'geojsonLayers',
      'options',
      'filters',
    ];

    // if we provide feature config, we enable it automatically
    if (gogoConfig instanceof GoGoFeature) gogoConfig.active = true;

    for (const prop in userConfig) {
      if (gogoConfig.hasOwnProperty(prop)) {
        if (typeof gogoConfig[prop] != 'object' || objectsProperties.indexOf(prop) > -1) {
          let new_prop;
          switch (prop) {
            case 'defaultBounds':
              new_prop = L.latLngBounds(userConfig[prop]);
              break;
            case 'defaultCenter':
              new_prop = L.latLng(userConfig[prop]);
              break;
            case 'filters':
              new_prop = [];
              for (const filter of userConfig[prop]) new_prop.push(new MenuFilter(filter));
              break;
            default:
              new_prop = userConfig[prop];
              break;
          }
          gogoConfig[prop] = new_prop;
        } else if (prop == 'colors') this.fillColors(gogoConfig[prop], userConfig[prop]);
        else this.recursiveFillProperty(gogoConfig[prop], userConfig[prop]);
      } else if (prop && prop != 'translations') {
        console.warn("[GoGoCarto] Config option '" + prop + "' does not exist");
      }
    }
  }

  private fillColors(gogoConfig, userConfig) {
    for (let prop in userConfig) {
      const color = tinycolor(userConfig[prop]);
      if (prop == 'text') prop = color.isDark() ? 'textDark' : 'testLight';
      if (prop == 'textSoft') prop = color.isDark() ? 'textDarkSoft' : 'testLightSoft';
      gogoConfig[prop] = color;
    }
  }

  private modifyTranslations(gogoConfig, userConfig) {
    for (const prop in userConfig) {
      gogoConfig.i18n[gogoConfig.language][prop] = userConfig[prop];
    }
  }
}
