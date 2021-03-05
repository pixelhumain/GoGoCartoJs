import { AppModule, AppStates, AppModes } from '../../app.module';
import { ElementBase, ElementStatus, ElementModerationState } from './element-base.class';
export { ElementStatus, ElementModerationState } from './element-base.class';
import { Marker } from '../../components/map/marker.component';
import { ElementComponent } from '../../components/element/element.component';
import { OptionValue, CategoryValue, Option, Category, Contribution, VoteReport, Stamp } from '../classes';
import { capitalize, formatLabel } from '../../utils/string-helpers';

import { App } from '../../gogocarto';
import { MapFeatureComponent } from '../../components/map/map-feature.component';
declare let $, Map;

// Standard fields managed by default info bar template
const CORE_FIELDS = [
  'id',
  'name',
  'description',
  'descriptionMore',
  'address',
  'telephone',
  'email',
  'website',
  'urls',
  'tags',
  'vimeoId',
  'images',
  'sourceKey',
  'updatedAt',
  'createdAt',
  'status',
  'moderationState',
  'searchScore',
];

export class Element extends ElementBase {
  private marker_: Marker = null;
  private component_: ElementComponent = null;
  private mapFeature_: MapFeatureComponent = null;

  colorOptionId: any;

  private isInitialized_ = false;

  iconsToDisplay: OptionValue[] = [];

  distance: number;
  distanceFromBoundsCenter: number;

  // for elements module algorithms
  isDisplayed = false;

  isShownAlone = false;
  isFavorite = false;
  needToBeUpdatedWhenShown = true;

  constructor(elementJson: any) {
    super(elementJson);
  }

  updateWithJson(elementJson) {
    super.updateWithJson(elementJson);
    this.createOptionsTree();
    this.update(true);
  }

  initialize() {
    App.elementIconsModule.updateIconsToDisplay(this);

    this.marker_ = new Marker(this);
    if (this.geoJSONFeature) {
      this.mapFeature_ = new MapFeatureComponent(this);
    }
    this.isInitialized_ = true;
  }

  update($force = false) {
    // console.log("marker update needToBeUpdated", this.needToBeUpdatedWhenShown);
    if (this.needToBeUpdatedWhenShown || App.mode == AppModes.List || $force) {
      App.elementIconsModule.updateIconsToDisplay(this);
      const optionValuesToUpdate = this.getCurrOptionsValues().filter((optionValue) => optionValue.isFilledByFilters);
      optionValuesToUpdate.push(this.getCurrMainOptionValue());
      for (const optionValue of optionValuesToUpdate)
        App.elementOptionValuesModule.updateOptionValueColor(this, optionValue);
      this.colorOptionId =
        this.getIconsToDisplay().length > 0 && this.getIconsToDisplay()[0]
          ? this.getIconsToDisplay()[0].colorOptionId
          : null;
      if (!this.colorOptionId) {
        const coloredOptionValues = optionValuesToUpdate.filter((ov) => ov && ov.colorOptionId);
        this.colorOptionId = coloredOptionValues.length > 0 ? coloredOptionValues[0].colorOptionId : null;
      }
      if (this.marker) this.marker.update();
      if (this.feature) this.feature.update();
      this.needToBeUpdatedWhenShown = false;
    }
    if (this.isDisplayedOnElementInfoBar()) this.showBigSize();
  }

  showBigSize() {
    if (this.marker) this.marker.showBigSize();
    if (this.feature) this.feature.showBigSize();
  }

  showNormalSize($force = false) {
    if (!$force && this.isDisplayedOnElementInfoBar()) return;
    if (this.marker) this.marker.showNormalSize();
    if (this.feature) this.feature.showNormalSize();
  }

  isDisplayedOnElementInfoBar() {
    return App.infoBarComponent.getCurrElementId() == this.id;
  }

  updateDistance() {
    this.distance = null;
    this.distanceFromBoundsCenter = App.boundsModule.extendedBounds
      ? App.boundsModule.extendedBounds.getCenter().distanceTo(this.position) / 1000
      : null;

    if (App.geocoder.getLocation()) this.distance = App.mapComponent.distanceFromLocationTo(this.position);
    else this.distance = this.distanceFromBoundsCenter;

    // Making the distance more realistic multiplying
    this.distance = this.distance ? Math.round(1.2 * this.distance) : null;
    this.distanceFromBoundsCenter = this.distanceFromBoundsCenter
      ? Math.round(1.2 * this.distanceFromBoundsCenter)
      : null;
  }

  getIconsToDisplay(): OptionValue[] {
    return this.iconsToDisplay;
  }

  getCurrOptionsValues(): OptionValue[] {
    if (App.config.menu.showOnePanePerMainOption)
      return this.optionsValues.filter((optionValue) => optionValue.option.mainOwnerId == App.currMainId);
    return this.optionsValues;
  }

  getCurrDeepestOptionsValues(): OptionValue[] {
    const currOptionValues = this.getCurrOptionsValues();
    let idsToRemove = [];
    for (const ov of currOptionValues) idsToRemove = idsToRemove.concat(ov.option_.parentOptionIds);
    const deepestOv = currOptionValues.filter((oV) => idsToRemove.indexOf(oV.option_.id) == -1);

    // group by owner
    const groupedByParentOvs = {};
    for (const ov of deepestOv) {
      const parentName = ov.option.parentOptionName;
      if (parentName in groupedByParentOvs) groupedByParentOvs[parentName].push(ov);
      else groupedByParentOvs[parentName] = [ov];
    }
    let deepestOrderedOv = [];
    for (const parent in groupedByParentOvs) {
      deepestOrderedOv = deepestOrderedOv.concat(groupedByParentOvs[parent]);
    }
    return deepestOrderedOv;
  }

  getCurrMainOptionValue(): OptionValue {
    return this.optionsValues.filter((optionValue) => optionValue.option.id == App.currMainId).shift();
  }

  getCategoriesIds(): number[] {
    return this.getCurrOptionsValues()
      .map((optionValue) => optionValue.categoryOwner.id)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  getOptionsIdsInCategorieId(categoryId): number[] {
    return this.getCurrOptionsValues()
      .filter((optionValue) => optionValue.option.ownerId == categoryId)
      .map((optionValue) => optionValue.optionId);
  }

  displayStamps(): Stamp[] {
    return App.stampModule.getAllowedStampForElement(this);
  }

  isPending() {
    return this.status == ElementStatus.PendingAdd || this.status == ElementStatus.PendingModification;
  }
  isDeleted() {
    return this.status <= ElementStatus.AdminRefused && this.status != ElementStatus.DynamicImportTemp;
  }
  needsModeration() {
    return this.moderationState != ElementModerationState.NotNeeded;
  }

  get marker(): Marker {
    return this.marker_;
  }
  get component() {
    return this.component_ || (this.component_ = new ElementComponent(this));
  }
  get isInitialized() {
    return this.isInitialized_;
  }
  get feature(): MapFeatureComponent {
    return this.mapFeature_;
  }

  toDisplay() {
    const result = {
      id: this.id,
      name: this.formatProp('name'),
      address: this.formatProp('address'),
      originalAddress: this.address,
      distance: this.distance,
      taxonomy: this.gogoTaxonomy(),
      status: this.status,
      isPending: this.isPending(),
      isDeleted: this.isDeleted(),
      images: this.images,
      files: this.files,
      needsModeration: this.needsModeration(),
      moderationState: this.moderationState,
      formatedOpenHours: this.formatedOpenHours,
      pendingContribution: this.pendingContribution,
      contributions: this.contributions,
      reports: this.reports,
      votes: this.votes,
      colorOptionId: this.colorOptionId,
      dateToDisplay: this.dateToDisplay
    };
    const customData = [];
    $.each(this.data, (key, value) => {
      if (!(key in result)) result[key] = this.formatProp(key);
      if (value && typeof value != 'object' && CORE_FIELDS.indexOf(key) == -1) {
        value = result[key];
        if (Array.isArray(value)) value = value.join(', ');
        customData.push(`<b>${formatLabel(key)}</b> ${value}`);
      }
    });
    result['customData'] = customData;

    return result;
  }

  formatProp(propertyName) {
    return App.elementFormaterModule.getProperty(this, propertyName);
  }
}
