import { OptionValue } from '../../classes/classes';
import { capitalize } from '../../utils/string-helpers';
import * as JsDiff from 'diff';

export class ElementDiffModule {
  getDiffValue(value, modifiedValue) {
    let spanClass = '',
      span = null;

    const DiffMethod = JsDiff.diffSentences;
    const diff = DiffMethod(value, modifiedValue);
    const display = document.createElement('div'),
      fragment = document.createDocumentFragment();

    diff.forEach(function (part) {
      spanClass = part.added ? 'added' : part.removed ? 'removed' : 'equals';
      span = document.createElement('span');
      if (spanClass) span.className = spanClass;
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    display.appendChild(fragment);

    return display.innerHTML;
  }

  getDiffOptionValues(optionValues: OptionValue[], newOptionValues: OptionValue[]) {
    const diffOptionsValues = [];
    const newOVIds = newOptionValues.map((obj) => obj.optionId);
    const oldOVIds = optionValues.map((obj) => obj.optionId);

    for (const ov of optionValues) {
      if (newOVIds.indexOf(ov.optionId) == -1) {
        ov.diff = 'removed';
        diffOptionsValues.push(ov);
      }
    }
    for (const newOv of newOptionValues) {
      const index = oldOVIds.indexOf(newOv.optionId);
      if (index == -1) {
        newOv.diff = 'added';
      } else {
        const modifiedValue = capitalize(newOv.description);
        let value = capitalize(optionValues[index].description),
          spanClass = '',
          span = null;
        const diff = JsDiff.diffWords(value, modifiedValue),
          display = document.createElement('div'),
          fragment = document.createDocumentFragment();

        diff.forEach(function (part) {
          spanClass = part.added ? 'added' : part.removed ? 'removed' : 'equals';
          span = document.createElement('span');
          if (spanClass) span.className = spanClass;
          span.appendChild(document.createTextNode(part.value));
          fragment.appendChild(span);
        });

        display.appendChild(fragment);

        newOv.description = display.innerHTML;
        newOv.diff = 'equals';
      }
      diffOptionsValues.push(newOv);
    }

    return diffOptionsValues;
  }
}
