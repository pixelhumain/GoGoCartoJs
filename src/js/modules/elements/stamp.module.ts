import { App } from '../../gogocarto';
import { Stamp, Element } from '../../classes/classes';

export class StampModule {
  allowedStamps: Stamp[] = [];

  defaultIcons = ['gogo-icon-stamp-1', 'gogo-icon-stamp-2'];
  defaultIcon = 'gogo-icon-stamp-1';

  constructor($config) {
    if ($config.features.stamp.options.allowedStamps)
      for (const stamp of $config.features.stamp.options.allowedStamps) {
        stamp.icon = stamp.icon || this.getDefaultIcon();
        this.allowedStamps.push(new Stamp(stamp));
      }
  }

  checkForAddingStamps(elementsArray: Element[]) {
    const elementsIds = elementsArray.map((el) => el.id);

    for (const stamp of this.allowedStamps) {
      const elementsToStamp = elementsArray.filter((el) => stamp.elementIds.indexOf(el.id) > -1);
      for (const element of elementsToStamp) element.stamps.push(stamp.id);
    }
  }

  getAllowedStampForElement(element: Element): Stamp[] {
    return this.allowedStamps.filter((stamp) => element.stamps.indexOf(stamp.id) > -1);
  }

  getDefaultIcon(): string {
    return this.defaultIcons.shift() || this.defaultIcon;
  }
}
