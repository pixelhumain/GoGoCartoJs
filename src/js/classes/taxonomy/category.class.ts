import { Option } from './option.class';
import {
  CategoryOptionTreeNode,
  CategoryOptionTreeNodeType,
} from '../../components/directory-menu/category-option-tree-node.class';
import { capitalize } from '../../utils/string-helpers';

export class Category extends CategoryOptionTreeNode {
  enableDescription: boolean;
  displaySuboptionsInline: boolean;
  useForFiltering: boolean; // if true, the element will be hidden when not fullfilling at least one checked option of this category
  isMandatory: boolean; // if the element have no option in this category, it will not be displayed
  isRootCategory: boolean;

  constructor($categoryJson: any) {
    super(CategoryOptionTreeNodeType.Category, '#category-', '#subcategorie-checkbox-', '.options-wrapper');

    this.id = $categoryJson.id;
    this.name = capitalize($categoryJson.name || '');
    this.nameShort = capitalize($categoryJson.nameShort || this.name);

    this.isRootCategory = $categoryJson.isRootCategory || false;

    this.displayInMenu =
      ($categoryJson.displayInMenu != undefined ? $categoryJson.displayInMenu : true) && this.name != '';
    this.displayInInfoBar =
      ($categoryJson.displayInInfoBar != undefined ? $categoryJson.displayInInfoBar : true) && this.name != '';

    this.showExpanded = $categoryJson.showExpanded !== false;
    this.unexpandable = $categoryJson.unexpandable || false;

    this.enableDescription = $categoryJson.enableDescription || false;
    this.displaySuboptionsInline = $categoryJson.displaySuboptionsInline || false;
    this.isMandatory = $categoryJson.isMandatory !== false;
    this.useForFiltering = $categoryJson.useForFiltering !== false;
    this.mainOwnerId = $categoryJson.mainOwnerId || null;
  }

  addOption($option: Option) {
    this.children.push($option);
  }

  get options(): Option[] {
    return <Option[]>this.children;
  }

  get disabledOptions(): Option[] {
    return <Option[]>this.disabledChildren();
  }
  get nonDisabledOptions(): Option[] {
    return <Option[]>this.nonDisabledChildren();
  }
  get checkedOptions(): Option[] {
    return <Option[]>this.checkedChildren();
  }
}
