declare let $: any;
import { App } from '../../gogocarto';
import { MenuFilter } from '../../classes/classes';
import { FilterAbstractComponent } from './filter-abstract.component';

export class FilterDateComponent extends FilterAbstractComponent {
  contextDate = null;

  initialize() {
    const self = this;

    // Display proper view filter when selecting type (day, week, month, year)
    this.dom.find('.view-type').click(function () {
      $(this).siblings('.view-type').removeClass('active');
      $(this).addClass('active');
      self.dom.find('.view-filter').hide();
      const viewFilter = self.dom.find(`.view-filter[data-name=${$(this).data('name')}]`).show();
      // if ($(this).data('name') == "range") viewFilter.css('display','flex')
      // else viewFilter.show()
      if (self.contextDate) viewFilter.datepicker('update', self.contextDate);

      // initialize week
      if ($(this).data('name') == 'week' && viewFilter.find('.selected-week').length == 0) {
        if (self.contextDate) viewFilter.find('td.day.active').closest('tr').addClass('selected-week');
        self.updateWeekDisplay();
        self.bindWeekClick();
      }

      if ($(this).data('name') == 'month') {
        // simulate date changed
        viewFilter.find('.datepicker-days:visible .datepicker-switch').trigger('click');
        self.onMonthChange(self.contextDate);
        self.bindMonthClick();
      }

      if ($(this).data('name') == 'year') {
        // simulate date changed
        viewFilter.find('.datepicker-days:visible .datepicker-switch').trigger('click');
        viewFilter.find('.datepicker-months:visible .datepicker-switch').trigger('click');
        self.onYearChange(self.contextDate);
        self.bindYearClick();
      }
    });
    setTimeout(() => this.dom.find('.view-type.active').trigger('click'), 0);

    // DAY
    this.dom
      .find('.view-filter[data-name=day]')
      .datepicker({
        // https://uxsolutions.github.io/bootstrap-datepicker
        todayBtn: 'linked',
        language: App.config.language,
        multidate: self.filter.options.multiday,
      })
      .on('changeDate', function (e) {
        self.filter.currentValue = { dates: e.dates };
        self.contextDate = e.date;
        if (e.dates.length > 0) self.emitFilterSet();
      });

    // WEEK
    this.dom
      .find('.view-filter[data-name=week]')
      .datepicker({
        // https://uxsolutions.github.io/bootstrap-datepicker
        toggleActive: true,
        todayHighlight: true,
        language: App.config.language,
      })
      .on('changeMonth', function (e) {
        setTimeout(() => self.bindWeekClick(), 0);
      });
    this.dom
      .find('.view-filter[data-name=week]')
      .find('.datepicker-days')
      .find('.prev, .next')
      .click(function (e) {
        if (!$(this).siblings('.datepicker-switch').hasClass('week-value')) return;

        const isPrev = $(this).hasClass('prev');
        const viewFilter = $(this).closest('.view-filter');
        let selectedWeek = viewFilter.find('.selected-week');
        let newWeek = isPrev ? selectedWeek.prev('tr') : selectedWeek.next('tr');

        // switch to prev/next month if needed
        if (newWeek.length == 0) {
          viewFilter.find('.datepicker-days .datepicker-switch').removeClass('week-value');
          viewFilter.find(`.datepicker-days .${isPrev ? 'prev' : 'next'}`).click();
          const startDayDate = selectedWeek.find('td:first-child').data('date');
          selectedWeek = viewFilter.find(`.datepicker-days td[data-date=${startDayDate}]`).closest('tr');
          self.bindWeekClick();
        }

        newWeek = isPrev ? selectedWeek.prev('tr') : selectedWeek.next('tr');
        selectedWeek.removeClass('selected-week');
        newWeek.addClass('selected-week');
        self.updateWeekDisplay();

        e.preventDefault();
        e.stopPropagation();
      });
    this.bindWeekClick();

    // MONTH
    this.dom
      .find('.view-filter[data-name=month]')
      .datepicker({
        // https://uxsolutions.github.io/bootstrap-datepicker
        language: App.config.language,
      })
      .on('changeMonth', function (e) {
        self.onMonthChange(e.date);
      })
      .on('changeYear', function (e) {
        setTimeout(() => self.bindMonthClick(), 0);
      });
    self.bindMonthClick();

    // YEAR
    this.dom
      .find('.view-filter[data-name=year]')
      .datepicker({
        // https://uxsolutions.github.io/bootstrap-datepicker
        language: App.config.language,
      })
      .on('changeYear', function (e) {
        self.onYearChange(e.date);
      })
      .on('changeDecade', function (e) {
        setTimeout(() => self.bindYearClick(), 0);
      });
    self.bindYearClick();

    // RANGE
    this.dom
      .find('.view-filter[data-name=range]')
      .datepicker({
        // https://uxsolutions.github.io/bootstrap-datepicker
        todayBtn: 'linked',
        format: App.config.translate('date.defaultFormatShort'),
        autoclose: true,
        language: App.config.language,
      })
      .on('changeDate', function (e) {
        const startDate = self.dom.find('input[name=start]').datepicker('getDate');
        self.filter.currentValue = { startDate: startDate, endDate: self.dom.find('input[name=end]').datepicker('getDate') };
        if (startDate) self.emitFilterSet();
      });
  }

  handleClear() {
    this.dom.find('.view-filter[data-name=day]').find('td.active').removeClass('active');
    this.dom.find('.view-filter[data-name=week]').find('.selected-week').removeClass('selected-week');
    this.dom.find('.view-filter[data-name=month]').find('.active').removeClass('active');
    this.dom.find('.view-filter[data-name=year]').find('.active').removeClass('active');
    this.contextDate = null;
    this.dom.find('.view-filter').datepicker('clearDates');
    this.bindWeekClick();
    this.bindMonthClick();
    this.bindYearClick();
  }

  bindWeekClick() {
    const self = this;

    this.dom
      .find('.view-filter[data-name=week]')
      .find('.datepicker-days tbody tr')
      .unbind()
      .click(function (e) {
        $(this).siblings('.selected-week').removeClass('selected-week');
        $(this).addClass('selected-week');
        self.updateWeekDisplay();
        e.preventDefault();
        e.stopPropagation();
      });
  }

  bindMonthClick() {
    const self = this;
    this.dom
      .find('.view-filter[data-name=month]')
      .find('.datepicker-months .month')
      .unbind()
      .click(function () {
        // self.dom.find('.view-filter[data-name=month]').find('.datepicker-months').addClass('force-display');
        setTimeout(() => {
          self.dom
            .find('.view-filter[data-name=month]')
            .find('.datepicker-days .day:not(.old):not(.new)')
            .first()
            .trigger('click');
          self.dom.find('.view-filter[data-name=month]').find('.datepicker-days .datepicker-switch').trigger('click');
          // self.dom.find('.view-filter[data-name=month]').find('.datepicker-months').removeClass('force-display');
          self.bindMonthClick();
        }, 0);
      });
  }

  bindYearClick() {
    const self = this;
    this.dom
      .find('.view-filter[data-name=year]')
      .find('.datepicker-years .year')
      .unbind()
      .click(function () {
        setTimeout(() => {
          self.dom
            .find('.view-filter[data-name=year]')
            .find('.datepicker-months .month:not(.old):not(.new)')
            .first()
            .trigger('click');
          self.dom
            .find('.view-filter[data-name=year]')
            .find('.datepicker-days .day:not(.old):not(.new)')
            .first()
            .trigger('click');
          self.dom.find('.view-filter[data-name=year]').find('.datepicker-months .datepicker-switch').trigger('click');
          self.dom.find('.view-filter[data-name=year]').find('.datepicker-months .datepicker-switch').trigger('click');
          self.bindYearClick();
        }, 0);
      });
  }

  updateWeekDisplay() {
    const viewFilter = this.dom.find('.view-filter[data-name=week]');
    if (viewFilter.find('tr.selected-week').length == 0) return;

    this.filter.currentValue = {
      startDate: new Date(viewFilter.find('tr.selected-week').find('td.day:first-child').data('date')),
      endDate: new Date(viewFilter.find('tr.selected-week').find('td.day:last-child').data('date')),
    };
    this.contextDate = this.filter.currentValue.startDate;

    let startDateFormat = 'd',
      endDateFormat = 'd';
    if (this.filter.currentValue.startDate.getMonth() != this.filter.currentValue.endDate.getMonth()) {
      startDateFormat += ' M';
      endDateFormat += ' M';
    } else {
      endDateFormat += ' MM';
    }
    if (this.filter.currentValue.startDate.getYear() != this.filter.currentValue.endDate.getYear()) {
      startDateFormat += ' yy';
      endDateFormat += ' yy';
    } else {
      endDateFormat += ' yyyy';
    }
    let weekDisplay = $.fn.datepicker.DPGlobal.formatDate(
      this.filter.currentValue.startDate,
      startDateFormat,
      App.config.language
    );
    weekDisplay +=
      ' - ' + $.fn.datepicker.DPGlobal.formatDate(this.filter.currentValue.endDate, endDateFormat, App.config.language);

    viewFilter.find('.datepicker-days .datepicker-switch').text(weekDisplay).addClass('week-value');
    this.emitFilterSet();
  }

  onMonthChange(date) {
    if (!date) return;
    this.filter.currentValue = { month: date.getMonth(), year: date.getYear() };
    this.contextDate = date;
    this.emitFilterSet();
  }

  onYearChange(date) {
    if (!date) return;
    this.filter.currentValue = { year: date.getYear() };
    this.contextDate = date;
    this.emitFilterSet();
  }
}
