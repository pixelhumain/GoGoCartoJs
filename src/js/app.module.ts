/// <reference types="leaflet" />

// MANAGERS
import { ModeManager, AppModes } from './managers/mode.manager';
import { StateManager, AppStates } from './managers/state.manager';
import { DataTypeManager, AppDataType } from './managers/data-type.manager';
import { ElementsManager } from './managers/elements.manager';
import { HistoryStateManager } from './managers/history-state.manager';
import { GeocodingManager } from './managers/geocoding.manager';
import { MapManager } from './managers/map.manager';

// MODULES
import { SearchModule } from './modules/search.module';
import { GeocoderModule } from './modules/geocoder.module';
import { FilterModule } from './modules/taxonomy/filter.module';
import { FilterRoutingModule } from './modules/taxonomy/filter-routing.module';
import { ElementsModule } from './modules/elements/elements.module';
import { ElementsJsonModule } from './modules/elements/elements-json.module';
import { FavoriteModule } from './modules/elements/favorite.module';
import { DisplayElementAloneModule } from './modules/map/display-element-alone.module';
import { AjaxModule } from './modules/ajax.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { TaxonomySkosModule } from './modules/taxonomy/taxonomy-skos.module';
import { RouterModule } from './modules/core/router.module';
import { LoginModule } from './modules/login.module';
import { TemplateModule } from './modules/core/template.module';
import { HistoryModule } from './modules/core/history.module';
import { BoundsModule } from './modules/bounds.module';
import { DocumentTitleModule } from './modules/core/document-title.module';
import { ElementJsonParserModule } from './modules/element/element-json-loader.module';
import { ElementFormaterModule } from './modules/element/formater.module';
import { ElementDiffModule } from './modules/element/diff.module';
import { ElementIconsModule } from './modules/element/icons.module';
import { ElementOptionValuesModule } from './modules/element/option-values.module';
import { StampModule } from './modules/elements/stamp.module';

// COMPONENTS
import { AppComponent } from './app.component';
import { ElementListComponent } from './components/list/element-list.component';
import { InfoBarComponent } from './components/map/info-bar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { DirectoryMenuComponent } from './components/directory-menu/directory-menu.component';
import { FiltersComponent } from './components/directory-menu/filters.component';
import { GoGoControlComponent } from './components/gogo-controls.component';
import { MapComponent } from './components/map/map.component';
import { MapControlsComponent } from './components/map/map-controls.component';
import { DirectionsComponent } from './components/map/directions.component';
import { CustomPopupComponent } from './components/custom-popup.component';

// MODALS
import { PickAddressComponent } from './components/modals/pick-address.component';
import { VoteComponent } from './components/modals/vote.component';
import { ReportComponent } from './components/modals/report.component';
import { DeleteComponent } from './components/modals/delete.component';
import { SendEmailComponent } from './components/modals/send-email.component';

// OTHERS
import { GoGoConfig } from './classes/config/gogo-config.class';
import * as Cookies from './utils/cookies';

// EXPORT
export { AppDataType } from './managers/data-type.manager';
export { AppStates } from './managers/state.manager';
export { AppModes } from './managers/mode.manager';

/*
 * App Module. Main module of the App*
 * AppModule creates all others components and modules
 */
export class AppModule {
  readonly config: GoGoConfig;
  readonly isIframe: boolean = false;
  readonly loadFullTaxonomy: boolean = true;
  readonly request: any = {};

  modeManager = new ModeManager();
  stateManager = new StateManager();
  dataTypeManager = new DataTypeManager();
  elementsManager: ElementsManager;
  historyStateManager = new HistoryStateManager();
  geocodingManager: GeocodingManager;
  mapManager: MapManager;

  search = new SearchModule();
  geocoder = new GeocoderModule();
  filterModule = new FilterModule();
  filterRoutingModule = new FilterRoutingModule();
  elementsModule = new ElementsModule();
  elementsJsonModule = new ElementsJsonModule();
  displayElementAloneModule = new DisplayElementAloneModule();
  ajaxModule = new AjaxModule();
  boundsModule: BoundsModule;
  routerModule = new RouterModule();
  templateModule = new TemplateModule();
  loginModule: LoginModule;
  historyModule = new HistoryModule();
  taxonomyModule = new TaxonomyModule();
  taxonomySkosModule = new TaxonomySkosModule();
  documentTitleModule = new DocumentTitleModule();
  elementJsonParser = new ElementJsonParserModule();
  elementFormaterModule = new ElementFormaterModule();
  elementDiffModule = new ElementDiffModule();
  elementIconsModule = new ElementIconsModule();
  elementOptionValuesModule = new ElementOptionValuesModule();
  favoriteModule = new FavoriteModule();
  stampModule: StampModule;

  component: AppComponent;
  infoBarComponent = new InfoBarComponent();
  mapComponent = new MapComponent();
  searchBarComponent = new SearchBarComponent();
  elementListComponent = new ElementListComponent();
  directoryMenuComponent = new DirectoryMenuComponent();
  filtersComponent = new FiltersComponent();
  gogoControlComponent = new GoGoControlComponent();
  directionsComponent = new DirectionsComponent();
  mapControlsComponent = new MapControlsComponent();
  customPopupComponent = new CustomPopupComponent();

  pickAddressComponent: PickAddressComponent;
  voteComponent: VoteComponent;
  reportComponent: ReportComponent;
  deleteComponent: DeleteComponent;
  sendEmailComponent: SendEmailComponent;

  constructor($config: any, $isIframe = false, $loadFullTaxonomy = true, $request = {}) {
    this.config = new GoGoConfig($config);
    this.isIframe = $isIframe;
    this.loadFullTaxonomy = $loadFullTaxonomy;
    this.request = $request;

    this.loginModule = new LoginModule(this.config.security.userRoles, this.config.security.userEmail);
    this.boundsModule = new BoundsModule(this.config);
    this.stampModule = new StampModule(this.config);

    Cookies.createCookie('firstVisit', 'done');
  }

  initialize() {
    this.component = new AppComponent();
    this.elementsManager = new ElementsManager();
    this.geocodingManager = new GeocodingManager();
    this.mapManager = new MapManager();

    // intialize modals component (template as been created after AppModule)
    this.pickAddressComponent = new PickAddressComponent();
    this.voteComponent = new VoteComponent();
    this.reportComponent = new ReportComponent();
    this.deleteComponent = new DeleteComponent();
    this.sendEmailComponent = new SendEmailComponent();
  }

  // ---------------------------
  // Getters & Setters Shortcuts
  // ---------------------------

  map(): L.Map {
    return this.mapComponent ? this.mapComponent.getMap() : null;
  }

  elements() {
    return this.elementsModule.currVisibleElements();
  }

  elementById(id) {
    return this.elementsModule.getElementById(id);
  }

  get DEAModule() {
    return this.displayElementAloneModule;
  }

  get currMainId() {
    return this.filtersComponent.currentActiveMainOptionId;
  }

  get state() {
    return this.stateManager.state;
  }

  setState($newState: AppStates, $options: any = {}, $backFromHistory = false) {
    this.stateManager.setState($newState, $options, $backFromHistory);
  }

  get mode() {
    return this.modeManager.mode;
  }

  setMode(mode: AppModes, backFromHistory = false, updateTitleAndState = true) {
    this.modeManager.setMode(mode, backFromHistory, updateTitleAndState);
  }

  get dataType() {
    return this.dataTypeManager.dataType;
  }

  setDataType($dataType: AppDataType, $backFromHistory = false, $searchResult = null) {
    this.dataTypeManager.setDataType($dataType, $backFromHistory, $searchResult);
  }
}
