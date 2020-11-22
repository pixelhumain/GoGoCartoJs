declare let $: any;
import { App } from '../../gogocarto';
import { MenuFilter } from '../../classes/classes';

export class FilterAbstractComponent {
  filter = null;

  constructor(filter: MenuFilter) {
    this.filter = filter;
    this.initialize();

    const self = this;
    // CLEAR BUTTON
    this.clearButton.click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.handleClear();
      self.filter.currentValue = {};
      App.elementsModule.updateElementsToDisplay(true);
      $(this).hide();
      return false;
    });
  }

  get dom() {
    return $(`.filter-wrapper[data-id=${this.filter.id}]`);
  }
  get clearButton() {
    return $(`.btn-clear-filter[data-id=${this.filter.id}]`);
  }

  emitFilterSet() {
    App.elementsModule.updateElementsToDisplay(true);
    this.clearButton.show();
  }
  initialize() {}

  handleClear() {}
}
