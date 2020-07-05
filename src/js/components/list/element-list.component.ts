import { AppModule, AppStates, AppDataType } from '../../app.module';
import { App } from '../../gogocarto';
import { ElementsToDisplayChanged } from '../../modules/elements/elements.module';
import { Element } from '../../classes/classes';
import { Event } from '../../classes/event.class';
import { arraysEqual } from '../../utils/array';
import * as noUiSlider from 'nouislider';

declare let $;

export class ElementListComponent {
  elementToDisplayCount = 0;
  visibleElementIds : string[] = [];

	// Number of element in one list
	ELEMENT_LIST_SIZE_STEP : number = 5;
	// Basicly we display 1 ELEMENT_LIST_SIZE_STEP, but if user need
	// for, we display an others ELEMENT_LIST_SIZE_STEP more
	stepsCount : number = 1;
	isListFull : boolean = false;

  // last request was send with this distance
  lastDistanceRequest = 10;

	isInitialized : boolean = false;

	locRangeSlider;
	locRangeValue : number = null;
  locRangeChanged : boolean = false; // If user manually changed the loc range

	constructor() {}

  initialize() {
    // detect when user reach bottom of list
    const that = this;
    $('#directory-content-list .elements-container').on('scroll', function (e) {
      if ($(this).scrollTop() > 0) $('#list-title-shadow-bottom').show();
      else $('#list-title-shadow-bottom').hide();

      if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        that.handleBottom();
      }
    });
		this.locRangeSlider = $('#directory-content-list #location-slider')[0];
		noUiSlider.create(this.locRangeSlider, {
	    start: [10],
	    connect: true,
	    format: {
        to: function (value) {
          return value.toFixed(0) + ' km';
        },
        from: function (value) {
          return Number(value.replace(' km', ''));
        }
    	},
    	step: 1,
	    tooltips: true,
	    range: {
        'min': 1,
        'max': 1000
	    }
		});

		$('#directory-content-list .noUi-tooltip').addClass('gogo-section-content-opposite')

		this.locRangeSlider.noUiSlider.on('change.one', (values) => {
			let radius = Number(values[0].replace(' km', ''))
			this.locRangeValue = radius;
      console.log("slider change", radius);
			App.boundsModule.createBoundsFromLocation(App.boundsModule.extendedBounds.getCenter(), radius)
      // draw again, this time filtering by distance will be different
      this.draw(App.elementsModule.currVisibleElements());
      this.locRangeChanged = true
			// App.elementsManager.checkForNewElementsToRetrieve(true);
		});
	}

  update($elementsToDisplay: Element[]) {
    if ($elementsToDisplay.length == 0) this.stepsCount = 1;

    this.hideSpinnerLoader();
    this.draw($elementsToDisplay, false);
  }

  setTitle($value: string) {
    $('.element-list-title-text').html($value);
  }

  show() {
    $('#directory-content-list').show();
    this.locRangeChanged = false // reinitialize this boolean
  }

  hide() {
    $('#directory-content-list').hide();
  }

  showSpinnerLoader() {
    $('#directory-list-spinner-loader').show();
  }

  hideSpinnerLoader() {
    $('#directory-list-spinner-loader').hide();
  }

	clear() {
    $('#directory-content-list li, #directory-content-list .title-separator').remove();
    this.visibleElementIds = [];
  }

	updateLocRangeSliderFromCurrBounds()
	{
		this.locRangeValue = App.boundsModule.boundsRadiusInKm() || 30;
		console.log("updateLocRangeSliderFromCurrBounds", this.locRangeValue);
		this.locRangeSlider.noUiSlider.set(this.locRangeValue)
	}

	reInitializeElementToDisplayLength()
	{
		this.clear();
		$('#directory-content-list .elements-container').animate({scrollTop: '0'}, 0);
		this.stepsCount = 1;
	}

  log = false;

  private draw($elementList: Element[], $animate = false) {
    let element: Element;
    let elementsToDisplay = $elementList.filter((el) => el.isFullyLoaded);

    if (this.log) console.log('-------------');
    if (this.log) console.log('ElementList draw', elementsToDisplay.length);
		if (App.dataType == AppDataType.All)
		{
			for(element of elementsToDisplay) element.updateDistance();

			if (App.config.infobar.displayDateField) {
				if (this.locRangeValue != null)
					elementsToDisplay = elementsToDisplay.filter(el => el.distance < this.locRangeValue);
				elementsToDisplay.sort(this.compareDate);
			}
			else
				elementsToDisplay.sort(this.compareDistance);
		}
		else if (App.dataType == AppDataType.SearchResults)
		{
			elementsToDisplay.sort(this.compareSearchScore);
		}

    this.elementToDisplayCount = elementsToDisplay.length;
    const maxElementsToDisplay = this.ELEMENT_LIST_SIZE_STEP * this.stepsCount;

    this.updateResultMessage();

    // If new elements to display are different than the visible one, draw them
    const newIdsToDisplay = elementsToDisplay.map((el) => el.id);
    if (this.log)
      console.log('Already Visible elements', this.visibleElementIds, 'new elements length', newIdsToDisplay.length);
    if ( (newIdsToDisplay.length >= maxElementsToDisplay || App.ajaxModule.allElementsReceived)
         && arraysEqual(newIdsToDisplay, this.visibleElementIds)) {
      if (this.log) console.log('nothing to draw');
      this.handleAllElementsRetrieved();
      return;
    }

    const newElementsToDisplayIncludesOldOnes = this.visibleElementIds.every(
      (id) => newIdsToDisplay.indexOf(id) !== -1
    );
    let newElementsToDraw;
    if (newElementsToDisplayIncludesOldOnes) {
      newElementsToDraw = elementsToDisplay.filter((el) => this.visibleElementIds.indexOf(el.id) == -1);
    } else {
      this.clear();
      newElementsToDraw = elementsToDisplay;
    }

		if (this.log) console.log("startIndex", startIndex, "endIndex", endIndex);
		let listContentDom = $('#directory-content-list ul.collapsible');
    const that = this;
    let currMonth = null; let currYear = null;
		let prevMonth = null; let prevYear = null;
    if (App.config.infobar.displayDateField && startIndex > 0) {
      let lastElement = elementsToDisplay[startIndex - 1]
      prevMonth = lastElement.dateToDisplay.getMonth();
      prevYear = lastElement.dateToDisplay.getFullYear();
    }
    for (const element of newElementsToDraw) {
      this.visibleElementIds.push(element.id);
			if (App.config.infobar.displayDateField)
			{
				currMonth = element.dateToDisplay.getMonth()
				currYear = element.dateToDisplay.getFullYear()
				if (currMonth != prevMonth || currYear != prevYear)
				{
					// month/year title
					listContentDom.append(`<div class="title-separator">${$.fn.datepicker.dates[App.config.language].months[currMonth]} ${currYear}</div>`)
				}
				prevMonth = currMonth
				prevYear = currYear
			}
      // add element
			listContentDom.append(element.component.render());
			// bind element header click
      element.component.dom.find('.collapsible-header').click(function () {
        that.onElementOpen(this);
      });
      if (this.visibleElementIds.length >= maxElementsToDisplay) break; // only display limited elements count
    }

    if ($animate) $('#directory-content-list .elements-container').animate({ scrollTop: '0' }, 500);
    $('#directory-content-list ul').collapsible({ accordion: true });
    // if the list is not full, we send ajax request
    if (elementsToDisplay.length < maxElementsToDisplay)
    {
      if (App.dataType == AppDataType.All)
      {
        // expand bounds
        let isAlreadyMaxBounds = App.boundsModule.extendedBounds == App.boundsModule.maxBounds;
        console.log("not enugh elements, expand bounds. IsAlreadyMaxBounds", isAlreadyMaxBounds);
        if (!App.ajaxModule.allElementsReceived && App.boundsModule.extendBounds(0.5)) {
          this.showSpinnerLoader();
          App.elementsManager.checkForNewElementsToRetrieve(true);
        } else {
          // When switching to List mode, we initialize bounds from the viewport
          // If all elements are already retrieve, the bounds are extended to maxBounds in extendBounds method
          // Then, only once after this setup to the maxBounds, we need to updateElementToDisplay
          if (!isAlreadyMaxBounds) App.elementsModule.updateElementsToDisplay(true, false);
          this.handleAllElementsRetrieved();
        }
      }
    }
    else
    {
      // console.log("list is full");
      // waiting for scroll bottom to add more elements to the list
      this.isListFull = true;
    }
	}

  private onElementOpen(elementHeaderDom)
  {
    let elementDom = $(elementHeaderDom).closest('.element-item');
    let elementId = elementDom.data('element-id');
    let element =  App.elementById(elementId);

    // initialize element component
    if (!$(elementHeaderDom).hasClass('initialized')) {
      element.component.initialize();

      element.component.imagesComponent.onNewImageDisplayed.do((image) => {
        elementDom.find('.img-overlay').css('height', elementDom.find('.img-container').height());
      });

      setTimeout(() => {
        $(elementHeaderDom).addClass('initialized');
      }, 0);
    }

    setTimeout(() => {
      element.component.menuComponent.checkDisplayFullText();
    }, 0);

    // on open animation end
    setTimeout(() => {
      this.onElementFullyOpenned(elementDom);
    }, 300);
  }

  private onElementFullyOpenned(elementDom) {
    const listContainerDom = $('#directory-content-list .elements-container');
    elementDom.find('.img-overlay').css('height', elementDom.find('.img-container').height());

    // check the visibility of an item after it has been expanded
    const elementDistanceToTop = elementDom.offset().top - listContainerDom.offset().top;

    // if element not visible on screen
    if (
      elementDom.offset().top - listContainerDom.offset().top + elementDom.height() >
      listContainerDom.outerHeight() + 150
    ) {
      listContainerDom.animate(
        {
          scrollTop: listContainerDom.scrollTop() + elementDom.offset().top - listContainerDom.offset().top,
        },
        550
      );
    }
    // if element is too high
    else if (elementDistanceToTop < 0) {
      listContainerDom.animate({ scrollTop: listContainerDom.scrollTop() + elementDistanceToTop }, 300);
    }
    setTimeout(() => $('.info-bar-tabs').tabs(), 0);
  }

  private updateResultMessage() {
    $('.no-result-message').hide();

    if (this.elementToDisplayCount > 0) {
      $('.element-list-header .title-text').show();
      $('.element-list-title-number-results').text('(' + this.elementToDisplayCount + ')');
    } else $('.element-list-header .title-text').hide();
  }

  handleAllElementsRetrieved() {
    this.hideSpinnerLoader();
    if (this.elementToDisplayCount == 0) {
      $('.element-list-title-number-results').text('(0)');
      $('.no-result-message').show();
      const noResultImg = $('.no-result-message img');
      noResultImg.attr('src', noResultImg.data('src'));
      $('.element-list-header .title-text').show();
    }
  }

  private handleBottom() {
    if (this.isListFull) {
      this.stepsCount++;
      if (this.log) console.log('bottom reached');
      this.isListFull = false;
      this.draw(App.elements());
    }
  }

  private compareDistance(a: Element, b: Element) {
    if (a.distanceFromBoundsCenter == b.distanceFromBoundsCenter) return 0;
    return a.distanceFromBoundsCenter < b.distanceFromBoundsCenter ? -1 : 1;
  }

	private compareDate(a:Element, b:Element)
	{
		if (a.dateToDisplay.getDate() == b.dateToDisplay.getDate() &&
				a.dateToDisplay.getMonth() == b.dateToDisplay.getMonth() &&
				a.dateToDisplay.getFullYear() == b.dateToDisplay.getFullYear())
			return a.distance < b.distance ? -1 : 1
	  return a.dateToDisplay < b.dateToDisplay ? -1 : 1;
	}

	private compareSearchScore(a:Element,b:Element)
	{
	  if (a.searchScore == b.searchScore) return 0;
	  return a.searchScore < b.searchScore ? 1 : -1;
	}
}
