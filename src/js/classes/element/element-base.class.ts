import { Contribution, VoteReport, OptionValue, PostalAddress, Option, CategoryValue } from "../classes";
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

export enum ElementStatus 
{
  ModifiedElement = -5,
  Deleted = -4,
  CollaborativeRefused = -3,
  AdminRefused = -2,    
  PendingModification = -1,
  PendingAdd = 0,
  AdminValidate = 1,
  CollaborativeValidate = 2
}

export enum ElementModerationState
{
  GeolocError = -2,
  NoOptionProvided = -1,     
  NotNeeded = 0,
  ReportsSubmitted = 1,
  VotesConflicts = 2, 
  PendingForTooLong = 3     
}

export class ElementBase
{
  id : string;
  status : ElementStatus;
  moderationState : ElementModerationState;
 
  name : string;
  position : L.LatLng;
  address : PostalAddress;
  description : string;
  longDescription: string;
  longDescriptionMore: string;
  commitment : string;  
  telephone : string;
  website : string;
  email : string;
  openHours : any;
  formatedOpenHours;
  openHoursDays : string[] = [];
  openHoursMoreInfos : any;
  image : string;
  
  modifiedElement : ElementBase = null;

  optionsValues : OptionValue[] = [];
  stamps : any[] = [];

  mainOptionOwnerIds : number[] = [];

  reports : VoteReport[];
  contributions : Contribution[];
  pendingContribution : Contribution;
  votes : VoteReport[];

  optionTree : OptionValue;  

  searchScore : number = null;

  isFullyLoaded : boolean = false;

  constructor(elementJson : any)
  {
    this.updateWithJson(elementJson);    
  }

  updateWithJson(elementJson : any) 
  {
    App.elementJsonParser.load(elementJson, this);    
  }  

  createOptionsTree()
  {
    App.elementOptionValuesModule.createOptionsTree(this);
  }

  getOptionTree()
  {
    if (this.optionTree) return this.optionTree;
    this.createOptionsTree();
    return this.optionTree;
  }

  getRootCategoriesValues() : CategoryValue[]
  {
    let optionTree = this.getOptionTree();
    if (optionTree.children[0].category.isRootCategory) return optionTree.children;
    return optionTree.children[0].children[0].children;
  }

  getOptionValueByCategoryId($categoryId)
  {
    return this.optionsValues.filter((oV) => oV.categoryOwner.id == $categoryId);
  }

  getOptionValuesNames()
  {
    return this.optionsValues.map( (ov) => ov.option.nameShort);
  }

  haveOption($option : Option)
  {
    return this.optionsValues.map( (ov) => ov.optionId).indexOf($option.id) >= 0;
  }
}