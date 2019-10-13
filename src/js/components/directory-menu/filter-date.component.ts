declare let $ : any;
import { App } from "../../gogocarto";
import { MenuFilter } from "../../classes/classes";

export class FilterDateComponent
{
  filter = null;
  contextDate = null;

  constructor(filter: MenuFilter) {
    this.filter = filter;
    this.initialize();
  }

  get dom() { return $(`.filter-wrapper[data-id=${this.filter.id}]`) }
  get clearButton() { return $(`.btn-clear-filter[data-id=${this.filter.id}]`) }

  initialize()
  {
    let self = this;

    // Display proper view filter when selecting type (day, week, month, year)
    this.dom.find('.view-type').click(function() {
      $(this).siblings('.view-type').removeClass('active');
      $(this).addClass('active');
      self.dom.find('.view-filter').hide();
      let viewFilter = self.dom.find(`.view-filter[data-name=${$(this).data('name')}]`).show()
      // if ($(this).data('name') == "range") viewFilter.css('display','flex')
      // else viewFilter.show()
      if (self.contextDate) viewFilter.datepicker('update', self.contextDate);

      // initialize week
      if ($(this).data('name') == "week" && viewFilter.find('.selected-week').length == 0) {
        if (self.contextDate) viewFilter.find('td.day.active').closest('tr').addClass('selected-week');
        self.updateWeekDisplay();
        self.bindWeekClick();
      }

      if ($(this).data('name') == "month") {
        // simulate date changed
        viewFilter.find('.datepicker-days:visible .datepicker-switch').trigger('click')
        self.onMonthChange(self.contextDate);
        self.bindMonthClick();
      }
    })
    this.dom.find('.view-type.active').trigger('click')

    // DAY
    this.dom.find('.view-filter[data-name=day]').datepicker({ // https://uxsolutions.github.io/bootstrap-datepicker
      todayBtn: "linked",
      language: App.config.language,
      multidate: self.filter.subtype != "range" && self.filter.options.multidate,
    }).on("changeDate", function(e) {
      self.filter.currentValue = { dates: e.dates };
      if (e.dates.length > 0) self.clearButton.show();
      self.contextDate = e.date;
      App.elementsModule.updateElementsToDisplay(true);
    });

    // WEEK
    this.dom.find('.view-filter[data-name=week]').datepicker({ // https://uxsolutions.github.io/bootstrap-datepicker
      toggleActive: true,
      todayHighlight: true,
      language: App.config.language
    }).on("changeMonth", function(e) {
      setTimeout( () => self.bindWeekClick(), 0)
    });
    this.dom.find('.view-filter[data-name=week]').find('.datepicker-days').find('.prev, .next').click(function(e) {
      if (!$(this).siblings('.datepicker-switch').hasClass('week-value')) return;

      let isPrev = $(this).hasClass('prev');
      let viewFilter = $(this).closest('.view-filter')
      let selectedWeek = viewFilter.find('.selected-week')
      let newWeek = isPrev ? selectedWeek.prev('tr') : selectedWeek.next('tr');

      // switch to prev/next month if needed
      if (newWeek.length == 0) {
        viewFilter.find('.datepicker-days .datepicker-switch').removeClass('week-value')
        viewFilter.find(`.datepicker-days .${isPrev ? 'prev' : 'next'}`).click()
        let startDayDate = selectedWeek.find('td:first-child').data('date')
        selectedWeek = viewFilter.find(`.datepicker-days td[data-date=${startDayDate}]`).closest('tr')
        self.bindWeekClick();
      }

      newWeek = isPrev ? selectedWeek.prev('tr') : selectedWeek.next('tr');
      selectedWeek.removeClass('selected-week');
      newWeek.addClass('selected-week')
      self.updateWeekDisplay();

      e.preventDefault();
      e.stopPropagation();
    })
    this.bindWeekClick();

    // MONTH
    this.dom.find('.view-filter[data-name=month]').datepicker({ // https://uxsolutions.github.io/bootstrap-datepicker
      language: App.config.language,
    }).on("changeMonth", function(e) {
      self.onMonthChange(e.date)
    }).on('changeYear', function(e) {
      setTimeout( () => self.bindMonthClick(), 0);
    });
    self.bindMonthClick()

    // RANGE
    this.dom.find('.view-filter[data-name=range]').datepicker({ // https://uxsolutions.github.io/bootstrap-datepicker
      todayBtn: "linked",
      format: "dd/mm/yyyy",
      autoclose: true,
      language: App.config.language,
    }).on("changeDate", function(e) {
        self.filter.currentValue = { startDate: self.dom.find('input[name=start]').val(), endDate: self.dom.find('input[name=end]').val() };
        self.clearButton.show();
        App.elementsModule.updateElementsToDisplay(true);
    });

    // CLEAR BUTTON
    this.clearButton.click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.dom.find('.view-filter[data-name=day]').find('td.active').removeClass('active')
      self.dom.find('.view-filter[data-name=week]').find('.selected-week').removeClass('selected-week')
      self.dom.find('.view-filter[data-name=month]').find('.active').removeClass('active')
      self.filter.currentValue = {};
      self.contextDate = null;
      App.elementsModule.updateElementsToDisplay(true);
      $(this).hide();
      self.dom.find('.view-filter').datepicker('clearDates');
      return false;
    })
  }

  bindWeekClick()
  {
    let self = this;

    this.dom.find('.view-filter[data-name=week]').find('.datepicker-days tbody tr').unbind().click(function(e) {
      $(this).siblings('.selected-week').removeClass('selected-week')
      $(this).addClass('selected-week')
      self.updateWeekDisplay();
      e.preventDefault()
      e.stopPropagation()
    })
  }

  bindMonthClick()
  {
    let self = this;
    this.dom.find('.view-filter[data-name=month]').find('.datepicker-months .month').unbind().click(function() {
      // self.dom.find('.view-filter[data-name=month]').find('.datepicker-months').addClass('force-display');
      setTimeout( () => {
        self.dom.find('.view-filter[data-name=month]').find('.datepicker-days .day:not(.old):not(.new)').first().trigger('click')
        self.dom.find('.view-filter[data-name=month]').find('.datepicker-days .datepicker-switch').trigger('click')
        // self.dom.find('.view-filter[data-name=month]').find('.datepicker-months').removeClass('force-display');
        self.bindMonthClick();
      }, 0);
    })
  }

  updateWeekDisplay()
  {
    let viewFilter = this.dom.find('.view-filter[data-name=week]')
    if (viewFilter.find('tr.selected-week').length == 0) return;

    this.filter.currentValue = {
      startDate: new Date(viewFilter.find('tr.selected-week').find('td.day:first-child').data('date')),
      endDate:   new Date(viewFilter.find('tr.selected-week').find('td.day:last-child').data('date'))
    };
    this.contextDate = this.filter.currentValue.startDate;

    let startDateFormat = "d", endDateFormat = "d"
    if (this.filter.currentValue.startDate.getMonth() != this.filter.currentValue.endDate.getMonth()) {
      startDateFormat += " M"
      endDateFormat += " M"
    } else {
      endDateFormat += " MM"
    }
    if (this.filter.currentValue.startDate.getYear() != this.filter.currentValue.endDate.getYear()) {
      startDateFormat += " yy"
      endDateFormat += " yy"
    } else {
      endDateFormat += " yyyy"
    }
    let weekDisplay = $.fn.datepicker.DPGlobal.formatDate(this.filter.currentValue.startDate, startDateFormat, App.config.language)
    weekDisplay += ' - ' + $.fn.datepicker.DPGlobal.formatDate(this.filter.currentValue.endDate, endDateFormat, App.config.language)

    viewFilter.find('.datepicker-days .datepicker-switch').text(weekDisplay).addClass('week-value');
    this.clearButton.show();
    App.elementsModule.updateElementsToDisplay(true);
  }

  onMonthChange(date)
  {
    if (!date) return;
    this.filter.currentValue = { month: date.getMonth(), year: date.getYear() };
    this.contextDate = date;
    App.elementsModule.updateElementsToDisplay(true);
    this.clearButton.show();
  }
}