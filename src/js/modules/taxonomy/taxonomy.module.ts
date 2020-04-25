import { Option, Category } from '../../classes/classes';
export { Option, Category } from '../../classes/classes';
import { slugify } from '../../utils/string-helpers';
import { App } from '../../gogocarto';

export class TaxonomyModule {
  categories: Category[] = [];
  options: Option[] = [];

  // the full hierachic taxonomy
  taxonomy: Category;

  rootCategories: Category[];

  categoriesCreatedCount = 1;
  optionsCreatedCount = 1;

  constructor() {
    this.options = [];
    this.categories = [];
  }

  createTaxonomyFromJson(taxonomyJson): void {
    const isSkosTaxonomy = taxonomyJson['@graph'];
    if (isSkosTaxonomy) {
      taxonomyJson = App.taxonomySkosModule.convertSkosIntoGoGoTaxonomy(taxonomyJson);
    }

    if (Array.isArray(taxonomyJson) && taxonomyJson.length == 1) {
      taxonomyJson = taxonomyJson[0];
    }

    // If multiple root categories, we encapsulate them into a single fake category & root option
    if (Array.isArray(taxonomyJson) && taxonomyJson.length > 1) {
      for (const json of taxonomyJson) {
        json.isRootCategory = true;
      }
      taxonomyJson = {
        name: 'RootFakeCategory',
        options: [
          {
            name: 'RootFakeOption',
            displayInInfoBar: false,
            displayInMenu: false,
            showExpanded: true,
            subcategories: taxonomyJson,
          },
        ],
      };
    } else if (!isSkosTaxonomy) {
      taxonomyJson.isRootCategory = true;
    }

    this.taxonomy = this.recursivelyCreateCategoryAndOptions(taxonomyJson);
    this.rootCategories =
      this.taxonomy.name == 'RootFakeCategory' ? this.taxonomy.options[0].subcategories : [this.taxonomy];
    for (const option of this.mainCategory.children) {
      option.isMainOption = true;
    }

    if (this.rootCategories.length > 1) {
      for (const rootCategory of this.rootCategories) {
        this.recursivelyCalculateParentsOptionIds(rootCategory, this.taxonomy.options[0]);
      }
      return;
    }

    this.recursivelyCalculateParentsOptionIds(this.mainCategory);
  }

  private recursivelyCreateCategoryAndOptions(categoryJson: any): Category {
    return this.recursivelyCreateCategory(categoryJson);
  }

  private recursivelyCreateCategory(categoryJson: any): Category {
    if (!categoryJson.id) {
      categoryJson.id = this.categoriesCreatedCount++;
    }

    const category = new Category(categoryJson);

    if (categoryJson.options) {
      for (const optionJson of categoryJson.options) {
        this.recursivelyCreateOption(optionJson, category);
      }
    } else if (categoryJson.subcategories) {
      this.recursivelyCreateOption(
        {
          subcategories: categoryJson.subcategories,
          showExpanded: true,
          displayInMenu: false,
          displayInInfoBar: false,
        },
        category
      );
    }

    this.categories.push(category);

    return category;
  }

  private recursivelyCreateOption(optionJson: any, parentCategory: Category): void {
    optionJson.intId = this.optionsCreatedCount++;
    const option = new Option(optionJson);
    option.ownerId = parentCategory.id;

    if (optionJson.subcategories) {
      for (const subcategoryJson of optionJson.subcategories) {
        const subcategory = this.recursivelyCreateCategoryAndOptions(subcategoryJson);
        subcategory.ownerId = option.id;
        option.addCategory(subcategory);
      }
    } else if (optionJson.suboptions) {
      const subcategory = this.recursivelyCreateCategoryAndOptions({
        options: optionJson.suboptions,
        showExpanded: optionJson.showExpanded,
      });
      subcategory.ownerId = option.id;
      option.addCategory(subcategory);
    }

    parentCategory.addOption(option);
    this.options.push(option);
  }

  // We want every option to know all those parents Option ids
  // this method calculate those for all options
  private recursivelyCalculateParentsOptionIds(category: Category, parentOption: Option = null): void {
    for (const option of category.children) {
      if (option.isMainOption || parentOption === null) {
        option.mainOwnerId = 'all';
      } else if (parentOption.isMainOption || (!parentOption.mainOwnerId && parentOption.id != 'Racine')) {
        option.mainOwnerId = parentOption.id;
      } else {
        option.mainOwnerId = parentOption.mainOwnerId;
      }

      if (parentOption) {
        (<Option>option).parentOptionIds = parentOption.parentOptionIds.concat([parentOption.id]);
        (<Option>option).parentCategoryIds = parentOption.parentCategoryIds.concat([category.id]);
      } else {
        (<Option>option).parentCategoryIds.push(category.id);
      }

      for (const subcategory of option.children) {
        this.recursivelyCalculateParentsOptionIds(<Category>subcategory, <Option>option);
      }
    }
  }

  getMainOptions(): Option[] {
    return this.mainCategory.options;
  }

  getMainOptionsIdsWithAll(): any[] {
    const optionIds: any[] = this.getMainOptionsIds();
    optionIds.push('all');
    return optionIds;
  }

  getMainOptionsIds(): number[] {
    return this.getMainOptions().map((option) => option.id);
  }

  getCurrMainOption(): Option {
    return App.currMainId == 'all' ? null : this.getMainOptionById(App.currMainId);
  }

  getMainOptionBySlug($slug): Option {
    return this.getMainOptions()
      .filter((option: Option) => slugify(option.nameShort) == $slug)
      .shift();
  }

  getMainOptionById($id): Option {
    return this.getMainOptions()
      .filter((option: Option) => option.id == $id)
      .shift();
  }

  getCategoryById($id): Category {
    return this.categories.filter((category: Category) => category.id == $id).shift();
  }

  getOptionById($id): Option {
    return this.options.filter((option: Option) => option.id == $id).shift();
  }

  getOptionByIntId($id): Option {
    return this.options.filter((option: Option) => option.intId == $id).shift();
  }

  getCurrOptions(): Option[] {
    return this.options.filter((option: Option) => option.mainOwnerId == App.currMainId);
  }

  getRootCategories(): Category[] {
    return this.categories.filter((category: Category) => category.isRootCategory);
  }

  // the main category : i.e. the first root category (could have many root categories)
  get mainCategory() {
    return this.rootCategories[0];
  }
  get otherRootCategories() {
    return this.rootCategories.slice(1);
  }
}
