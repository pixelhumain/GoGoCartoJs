declare let $, jQuery : any;

import { AppModule, AppModes } from "../../app.module";
import { Category, Option } from "../../modules/taxonomy/taxonomy.module";
import { App } from "../../gogocarto";
import { Element } from "../../classes/classes";

export class FiltersComponent
{  
  currentActiveMainOptionId = null;

  constructor() {}

  initialize()
  {  
    $('.filter-menu .tooltipped').tooltip();

    App.mapComponent.onIdle.do( (elements)=> { this.updateElementCount(); });    

    // -------------------------------
    // --------- FAVORITE-------------
    // -------------------------------
    $('#filter-favorite').click(function(e : Event)
    {      
      let favoriteCheckbox = $('#favorite-checkbox');

      let checkValue = !favoriteCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyFavorite(checkValue);

      if (checkValue) {
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked',false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked',false);
      }
      
      App.elementsModule.updateElementsToDisplay(true);

      favoriteCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- PENDING-------------
    // -------------------------------
    $('#filter-pending').click(function(e : Event)
    {      
      let pendingCheckbox = $('#pending-checkbox');

      let checkValue = !pendingCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyPending(checkValue);
      
      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked',false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked',false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      pendingCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- MODERAITON-------------
    // -------------------------------
    $('#filter-moderation').click(function(e : Event)
    {      
      let moderationCheckbox = $('#moderation-checkbox');

      let checkValue = !moderationCheckbox.is(':checked');
      $('.show-only-container .subcategorie-option-item').removeClass('checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyModeration(checkValue);
      
      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked',false);
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked',false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      moderationCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });


    // -------------------------------
    // ------ MAIN OPTIONS -----------
    // -------------------------------
    var that = this;

    $('.main-categories .main-icon').click( function(e)
    {
      let optionId = $(this).attr('data-option-id');
      that.setMainOption(optionId);
    });

    // follow main active option background when user scroll through main options
    $('.main-categories').on('scroll', () =>
    {
      $('#active-main-option-background').css('top', $('#main-option-gogo-icon-' + this.currentActiveMainOptionId).position().top + $('.main-categories').scrollTop());
    });

    

    // ----------------------------------
    // ------ CATEGORIES ----------------
    // ----------------------------------
    $('.subcategory-item .name-wrapper:not(.uncheckable)').click(function()
    {    
      let categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggleChildrenDetail();
    });  

    $('.subcategory-item .checkbox-wrapper').click(function(e)
    {    
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      let categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggle();
      
    });      

    // Add surbrillance in main-categories sidebar filters menu whenn hovering a main category
    $('#main-option-all.show-one-pane-per-main-option .gogo-icon-name-wrapper').hover( 
      function(e : Event) {
        let optionId = $(this).attr('data-option-id');
        let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        if (!sidebarIcon.hasClass('hover')) sidebarIcon.addClass('hover');
      },
      function(e : Event) {
        let optionId = $(this).attr('data-option-id');
        let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        sidebarIcon.removeClass('hover');
      }
    );
    // -------------------------------
    // ------ SUB OPTIONS ------------
    // -------------------------------
    $('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation) .option-name').click(function(e : Event)
    {
      let optionDom = $(this).closest('.subcategorie-option-item');
      let optionId = optionDom.attr('data-option-id');
      let option = App.taxonomyModule.getOptionById(optionId);

      if (option.isMainOption && App.config.menu.showOnePanePerMainOption) App.filtersComponent.setMainOption(option.id);
      else if (optionDom.hasClass('uncheckable')) return;
      else if (option.isCollapsible()) option.toggleChildrenDetail()
      else option.toggle();
    });

    $('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation)').find('.icon, .checkbox-wrapper').click(function(e)
    {    
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      let optionId = $(this).closest('.subcategorie-option-item').attr('data-option-id');
      App.taxonomyModule.getOptionById(optionId).toggle();
    });
  }

  setMainOption(optionId)
  {
    if (this.currentActiveMainOptionId == optionId) return;
    if (this.currentActiveMainOptionId != null) App.elementsModule.clearCurrentsElement();

    let oldId = this.currentActiveMainOptionId;
    this.currentActiveMainOptionId = optionId;

    if (optionId == 'all')
    {
      $('#menu-subcategories-title').text("Tous les " + App.config.text.elementPlural);
    }
    else
    {
      let mainOption = App.taxonomyModule.getMainOptionById(optionId);
      $('#menu-subcategories-title').text(mainOption.name);
    }

    this.updateMainOptionBackground();
    App.infoBarComponent.hide();

    //console.log("setMainOptionId " + optionId + " / oldOption : " + oldId);
    if (oldId != null) App.historyModule.updateCurrState();

    setTimeout( () => {
      App.elementListComponent.reInitializeElementToDisplayLength();
    
      App.boundsModule.updateFilledBoundsAccordingToNewMainOptionId();
      App.elementsManager.checkForNewElementsToRetrieve();
      App.elementsModule.updateElementsToDisplay(true,true);
    }, 400);    
  }

  // the main option selected got a specific background, who can vertically translate
  updateMainOptionBackground()
  {
    let optionId = this.currentActiveMainOptionId;    

    $('.main-option-subcategories-container:not(#main-option-' + optionId + ')').hide();
    $('#main-option-' + optionId).fadeIn(400);
    $('.sub-categories-content ul').scrollTop(0)

    $('.main-categories .main-icon').removeClass('active');
    $('#main-option-gogo-icon-' + optionId).addClass('active');

    if(!$('#main-option-gogo-icon-' + optionId).position()) { return; }

    $('#active-main-option-background').animate({top: $('#main-option-gogo-icon-' + optionId).position().top + $('.main-categories').scrollTop()}, 400, 'easeOutQuart');
  }

  updateElementCount()
  {   
    if (App.config.menu.displayNumberOfElementForEachCategory) 
    {
      let allElements = App.elementsModule.currEveryElements(); 
      let bounds = App.map().getBounds();
      let elementsInBounds;
      if (App.mode == AppModes.Map)
         elementsInBounds = allElements.filter(element => bounds.contains(element.position));
      else
        elementsInBounds = allElements;

      let optionMappingCount = [];
      for(let option of App.taxonomyModule.options) {
        optionMappingCount[option.id] = 0;
      }
      let element : Element;
      for(element of elementsInBounds) {
        for(let ov of element.optionsValues) { optionMappingCount[ov.optionId]++ }
      }

      for(let option of App.taxonomyModule.options) 
      {
        let count = optionMappingCount[option.id];
        if (count == 0)
          $(`#option-${option.id} .elements-by-category-count`).hide();
        else {
          if (App.config.menu.displayNumberOfElementRoundResults) count = this.roundResult(count);
          $(`#option-${option.id} .elements-by-category-count`).show().text(count);
        }
           
      }
    }
  }

  private roundResult(count)
  {
    if (count < 10) return count;
    length = count.toString().length;
    let pow = Math.pow(10, length - 1);
    count = Math.floor(count/pow)*pow;
    return `${count}+`;
  }
}