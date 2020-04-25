import { Category } from './category.class';
import {
  CategoryOptionTreeNode,
  CategoryOptionTreeNodeType,
} from '../../components/directory-menu/category-option-tree-node.class';

import { capitalize, slugify } from '../../utils/string-helpers';
import * as tinycolor2 from 'tinycolor2';
const tinycolor = (<any>tinycolor2).default;

interface parentCategoryId {
  id: any;
  mandatorySiblingIds: any[];
}

export class Option extends CategoryOptionTreeNode {
  color: string;
  softColor: string;
  icon: string;
  useIconForMarker: boolean;
  useColorForMarker: boolean;
  textHelper: string;
  url: string; // allow to click an option inside the info bar

  displayChildrenInMenu: boolean;
  displayChildrenInInfoBar: boolean;

  intId: number; // And Id as number, used for creating the option url

  parentOptionIds: (string | number)[] = [];
  parentCategoryIds: parentCategoryId[] = [];

  constructor($optionJson: any) {
    super(CategoryOptionTreeNodeType.Option, '#option-', '#option-checkbox-', '.subcategories-wrapper');

    this.name = capitalize($optionJson.name);
    this.nameShort = capitalize($optionJson.nameShort || this.name);
    this.id = 'id' in $optionJson ? '' + $optionJson.id : slugify(this.nameShort);
    this.intId = typeof $optionJson.id == 'number' ? $optionJson.id : $optionJson.intId;
    this.url = $optionJson.url;

    this.displayInMenu = $optionJson.displayInMenu !== false;
    this.displayInInfoBar = $optionJson.displayInInfoBar !== false;
    this.displayChildrenInMenu = $optionJson.displayChildrenInMenu !== false;
    this.displayChildrenInInfoBar = $optionJson.displayChildrenInInfoBar !== false;

    this.showExpanded = $optionJson.showExpanded || false;
    this.unexpandable = $optionJson.unexpandable || false;

    this.color = $optionJson.color ? tinycolor($optionJson.color) : null;
    this.softColor = tinycolor($optionJson.softColor || this.color);
    this.icon = $optionJson.icon;
    if (this.icon && (this.icon.indexOf('fab ') > 0 || this.icon.indexOf('fas ') > 0)) this.icon += ' fa';
    this.textHelper = $optionJson.textHelper;
    this.useIconForMarker = 'useIconForMarker' in $optionJson ? $optionJson.useIconForMarker : !!this.icon;
    this.useColorForMarker = 'useColorForMarker' in $optionJson ? $optionJson.useColorForMarker : !!this.color;
  }

  addCategory($category: Category): void {
    this.children.push($category);
  }

  isCollapsible(): boolean {
    return this.getDom().hasClass('option-collapsible');
  }

  get subcategories(): Category[] {
    return <Category[]>this.children;
  }

  get allChildrenOptions(): Option[] {
    return this.recursivelyGetChildrenOption(this);
  }

  private recursivelyGetChildrenOption(parentOption: Option): Option[] {
    let resultOptions: Option[] = [];
    for (const cat of parentOption.subcategories) {
      resultOptions = resultOptions.concat(cat.options);
      for (const option of cat.options) {
        resultOptions = resultOptions.concat(this.recursivelyGetChildrenOption(option));
      }
    }
    return resultOptions;
  }

  get parentOptionName(): string {
    return this.getOwner() ? (this.getOwner().getOwner() ? this.getOwner().getOwner().name : '') : '';
  }
}
