import { Contribution, VoteReport, OptionValue, PostalAddress, Option, CategoryValue } from '../classes';
import { App } from '../../gogocarto';
import { Moment } from 'moment';

export enum ElementStatus {
  DynamicImportTemp = -7, // Temporary status used while importing
  Duplicate = -6,
  ModifiedElement = -5,
  Deleted = -4,
  CollaborativeRefused = -3,
  AdminRefused = -2,
  PendingModification = -1,
  PendingAdd = 0,
  AdminValidate = 1,
  CollaborativeValidate = 2,
  AddedByAdmin = 3,
  ModifiedByAdmin = 4,
  ModifiedByOwner = 5,
  ModifiedFromHash = 6,
  Imported = 7,
}

export enum ElementModerationState {
  GeolocError = -2,
  NoOptionProvided = -1,
  NotNeeded = 0,
  ReportsSubmitted = 1,
  VotesConflicts = 2,
  PendingForTooLong = 3,
  PossibleDuplicate = 4,
}

export class ElementBase {
  // MANDATORY DATA
  id: string;
  name: string;
  position: L.LatLng;
  address: PostalAddress;
  optionsValues: OptionValue[] = [];
  mainOptionOwnerIds: number[] = [];
  optionTree: OptionValue;

  // OPTIONAL DATA
  status: ElementStatus;
  moderationState: ElementModerationState;
  searchScore: number = null;
  isFullyLoaded = false;

  // SPECIFIC DATA
  openHours: any;
  formatedOpenHours;
  images: string[];
  files: string[];
  stamps: any[] = [];
  geoJSONFeature: any;

  // CUSTOM DATA
  data: any = {};
  // main element date used for filtering etc... Use config.infobar.displayDateField
  dateToDisplay: Moment = null;

  // ADMIN HISTORY DATA
  reports: VoteReport[];
  contributions: Contribution[];
  pendingContribution: Contribution;
  votes: VoteReport[];

  // PENDING ELEMENTS
  modifiedElement: ElementBase = null;

  constructor(elementJson: any) {
    this.updateWithJson(elementJson);
  }

  updateWithJson(elementJson: any) {
    App.elementJsonParser.load(elementJson, this);
  }

  createOptionsTree() {
    App.elementOptionValuesModule.createOptionsTree(this);
  }

  getOptionTree() {
    if (this.optionTree) return this.optionTree;
    this.createOptionsTree();
    return this.optionTree;
  }

  getRootCategoriesValues(): CategoryValue[] {
    const optionTree = this.getOptionTree();
    if (optionTree.children.length == 0) return [];
    if (optionTree.children[0].category.isRootCategory) return optionTree.children;
    return optionTree.children[0].children[0].children;
  }

  gogoTaxonomy(): CategoryValue[] {
    if (this.status == ElementStatus.PendingModification && this.modifiedElement)
      return this.modifiedElement.getRootCategoriesValues();
    else return this.getRootCategoriesValues();
  }

  getOptionValueByCategoryId($categoryId) {
    return this.optionsValues.filter((oV) => oV.categoryOwner.id == $categoryId);
  }

  getOptionValuesNames() {
    return this.optionsValues.map((ov) => ov.option.nameShort);
  }

  haveOption($option: Option) {
    return this.optionsValues.map((ov) => ov.optionId).indexOf($option.id) >= 0;
  }
}
