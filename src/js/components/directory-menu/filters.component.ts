import { AppModes } from '../../app.module';
import { App } from '../../gogocarto';
import { Element } from '../../classes/classes';

import { FilterDateComponent } from './filter-date.component';
import { FilterNumberComponent } from './filter-number.component';

export class FiltersComponent {
  currentActiveMainOptionId = null;

  constructor() {}

  initialize() {
    $('.filter-menu .tooltipped').tooltip();

    // App.mapComponent.onIdle.do( (elements)=> { this.updateElementCount(); });
    App.elementsModule.onElementsToDisplayChanged.do(() => {
      this.updateElementCount();
    });

    // -------------------------------
    // --------- FAVORITE-------------
    // -------------------------------
    $('#filter-favorite').click(function (e: JQueryMouseEventObject) {
      const favoriteCheckbox = $('#favorite-checkbox');

      const checkValue = !favoriteCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyFavorite(checkValue);

      if (checkValue) {
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked', false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked', false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      favoriteCheckbox.prop('checked', checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- PENDING-------------
    // -------------------------------
    $('#filter-pending').click(function (e: JQueryMouseEventObject) {
      const pendingCheckbox = $('#pending-checkbox');

      const checkValue = !pendingCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyPending(checkValue);

      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked', false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked', false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      pendingCheckbox.prop('checked', checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- MODERAITON-------------
    // -------------------------------
    $('#filter-moderation').click(function (e: JQueryMouseEventObject) {
      const moderationCheckbox = $('#moderation-checkbox');

      const checkValue = !moderationCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyModeration(checkValue);

      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked', false);
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked', false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      moderationCheckbox.prop('checked', checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // ------ CUSTOM FILTERS ---------
    // -------------------------------

    for (const filter of App.config.menu.filters) {
      switch (filter.type) {
        case 'date':
          new FilterDateComponent(filter);
          break;
        case 'number':
          new FilterNumberComponent(filter);
          break;
      }
    }

    $('.subcategory-item.filter').click(function () {
      $(this).next('.filter-wrapper').slideToggle({ duration: 350, easing: 'easeOutQuart' });
      $(this).toggleClass('expanded');
    });

    // -------------------------------
    // ------ MAIN OPTIONS -----------
    // -------------------------------
    const that = this;

    $('.main-categories .main-icon').click(function (e: JQueryMouseEventObject) {
      const optionId = $(this).attr('data-option-id');
      that.setMainOption(optionId);
    });

    // follow main active option background when user scroll through main options
    $('.main-categories').on('scroll', () => {
      $('#active-main-option-background').css(
        'top',
        $('#main-option-gogo-icon-' + this.currentActiveMainOptionId).position().top + $('.main-categories').scrollTop()
      );
    });

    // ----------------------------------
    // ------ CATEGORIES ----------------
    // ----------------------------------
    $('.subcategory-item:not(.filter) .name-wrapper:not(.uncheckable)').click(function () {
      const categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggleChildrenDetail();
    });

    $('.subcategory-item .checkbox-wrapper').click(function (e: JQueryMouseEventObject) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      const categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggle();
    });

    // Add surbrillance in main-categories sidebar filters menu whenn hovering a main category
    $('#main-option-all.show-one-pane-per-main-option .gogo-icon-name-wrapper').hover(
      function (e: JQueryMouseEventObject) {
        const optionId = $(this).attr('data-option-id');
        const sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        if (!sidebarIcon.hasClass('hover')) sidebarIcon.addClass('hover');
      },
      function (e: JQueryMouseEventObject) {
        const optionId = $(this).attr('data-option-id');
        const sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        sidebarIcon.removeClass('hover');
      }
    );
    // -------------------------------
    // ------ SUB OPTIONS ------------
    // -------------------------------
    $(
      '.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation) .option-name'
    ).click((e: JQueryMouseEventObject) => {
      const optionDom = $(e.currentTarget).closest('.subcategorie-option-item');
      const optionId = optionDom.attr('data-option-id');
      const uncheckable = optionDom.hasClass('uncheckable');

      App.filtersComponent.setOption(optionId, uncheckable);
    });

    $('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation)')
      .find('.icon, .checkbox-wrapper')
      .click(function (e: JQueryMouseEventObject) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        const optionId = $(this).closest('.subcategorie-option-item').attr('data-option-id');
        App.taxonomyModule.getOptionById(optionId).toggle();
      });
  }

  /**
   * @param {null|boolean} forceExpand If not null, the option will never be toggled.
   * @param {null|boolean} forceChecked If not null, the option will be checked if it's collapsible.
   */
  public setOption(
    optionId,
    uncheckable = false,
    humanAction = true,
    forceExpand: null | boolean = null,
    forceChecked: null | boolean = null
  ): void {
    const option = App.taxonomyModule.getOptionById(optionId);

    if (option.isMainOption && App.config.menu.showOnePanePerMainOption) {
      App.filtersComponent.setMainOption(option.id);
      return;
    }
    if (uncheckable) {
      return;
    }
    if (option.isCollapsible()) {
      option.toggleChildrenDetail(forceExpand);
      if (null === forceChecked) {
        return;
      }
    }

    if (null === forceExpand || null !== forceChecked) {
      option.toggle(forceChecked, humanAction);
    }
  }

  public setMainOption(optionId): void {
    if (this.currentActiveMainOptionId == optionId) {
      return;
    }
    if (this.currentActiveMainOptionId != null) {
      App.elementsModule.clearCurrentsElement();
    }

    const oldId = this.currentActiveMainOptionId;
    this.currentActiveMainOptionId = optionId;

    if (optionId == 'all') {
      $('#menu-subcategories-title').text('Tous les ' + App.config.translate('element.plural'));
    } else {
      const mainOption = App.taxonomyModule.getMainOptionById(optionId);
      $('#menu-subcategories-title').text(mainOption.name);
    }

    this.updateMainOptionBackground();
    App.infoBarComponent.hide();

    //console.log("setMainOptionId " + optionId + " / oldOption : " + oldId);
    if (oldId != null) {
      App.historyModule.updateCurrState();
    }

    setTimeout(() => {
      App.elementListComponent.reInitializeElementToDisplayLength();

      App.boundsModule.updateFilledBoundsAccordingToNewMainOptionId();
      App.elementsManager.checkForNewElementsToRetrieve();
      App.elementsModule.updateElementsToDisplay(true, true);
    }, 400);
  }

  // the main option selected got a specific background, who can vertically translate
  updateMainOptionBackground() {
    const optionId = this.currentActiveMainOptionId;

    $('.main-option-subcategories-container:not(#main-option-' + optionId + ')').hide();
    $('#main-option-' + optionId).fadeIn(400);
    $('.sub-categories-content ul').scrollTop(0);

    $('.main-categories .main-icon').removeClass('active');
    $('#main-option-gogo-icon-' + optionId).addClass('active');

    if (!$('#main-option-gogo-icon-' + optionId).position()) {
      return;
    }

    $('#active-main-option-background').animate(
      {
        top: $('#main-option-gogo-icon-' + optionId).position().top + $('.main-categories').scrollTop(),
      },
      400,
      'easeOutQuart'
    );
  }

  updateElementCount() {
    if (App.config.menu.displayNumberOfElementForEachCategory && App.map()) {
      const allElements = App.elementsModule.currEveryElements();
      const bounds = App.map().getBounds();
      let elementsInBounds;
      if (App.mode == AppModes.Map)
        elementsInBounds = allElements.filter((element) => bounds.contains(element.position));
      else elementsInBounds = allElements;

      const optionMappingCount = [],
        optionDisabledMappingCount = [];
      for (const option of App.taxonomyModule.options) {
        optionMappingCount[option.id] = 0;
        optionDisabledMappingCount[option.id] = 0;
      }
      let element: Element;
      const displayedElements = elementsInBounds.filter((element) => element.isDisplayed);
      for (element of displayedElements) {
        for (const ov of element.optionsValues) {
          optionMappingCount[ov.optionId]++;
        }
      }
      for (element of allElements) {
        for (const ov of element.optionsValues) {
          optionDisabledMappingCount[ov.optionId]++;
        }
      }

      for (const option of App.taxonomyModule.options) {
        let count = option.isChecked ? optionMappingCount[option.id] : optionDisabledMappingCount[option.id];
        if (count == 0) $(`#option-${option.id} .elements-by-category-count`).hide();
        else {
          if (App.config.menu.displayNumberOfElementRoundResults) count = this.roundResult(count);
          $(`#option-${option.id} .elements-by-category-count`).show().text(count);
        }
      }
    }
  }

  private roundResult(count) {
    if (count < 10) return count;
    length = count.toString().length;
    const pow = Math.pow(10, length - 1);
    count = Math.floor(count / pow) * pow;
    return `${count}+`;
  }
}
