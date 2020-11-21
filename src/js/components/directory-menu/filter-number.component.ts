declare let $: any;
import { App } from '../../gogocarto';
import { MenuFilter } from '../../classes/classes';
import { FilterAbstractComponent } from './filter-abstract.component';

export class FilterNumberComponent extends FilterAbstractComponent {
  initialize() {
    const self = this;
    this.dom.find('input.simple-value').change(function (e) {
      self.filter.currentValue.value = $(this).val();
      self.emitFilterSet();
    });
  }

  handleClear() {
    this.dom.find('input').val('');
  }
}
