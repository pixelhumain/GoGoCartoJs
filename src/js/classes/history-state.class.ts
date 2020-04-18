import { AppModule, AppStates, AppModes, AppDataType } from '../app.module';
import { ViewPort } from './map/viewport.class';
declare let L: any;

export class HistoryState {
  mode: AppModes;
  state: AppStates;
  dataType: AppDataType;
  address: string;
  viewport: ViewPort;
  id: any;
  text: string;
  filters: string;

  parse($historyState: any): HistoryState {
    this.mode = $historyState.mode == 'Map' ? AppModes.Map : AppModes.List;
    this.state = parseInt(AppStates[$historyState.state]);
    this.dataType = parseInt(AppDataType[$historyState.dataType]);
    this.address = $historyState.address;
    this.viewport =
      typeof $historyState.viewport === 'string'
        ? new ViewPort().fromString($historyState.viewport)
        : $historyState.viewport;
    this.id = $historyState.id;
    this.text = $historyState.text;
    this.filters = $historyState.filters;
    return this;
  }
}
