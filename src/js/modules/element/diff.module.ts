import { OptionValue } from "../../classes/classes";
import { capitalize } from "../../utils/string-helpers";
declare var JsDiff : any;

var diffConfiguration =
{
  name: JsDiff.diffSentences,
  description: JsDiff.diffSentences,
  address: JsDiff.diffSentences,
  commitment: JsDiff.diffSentences,
  telephone: JsDiff.diffSentences,
  website: JsDiff.diffSentences,
  email: JsDiff.diffSentences,
  openHoursMoreInfos: JsDiff.diffSentences,
}

export class ElementDiffModule
{
  getDiffValue(value, modifiedValue, propertyName)
  {
    let spanClass = '',
    span = null;

    let DiffMethod = diffConfiguration[propertyName] ? diffConfiguration[propertyName] : JsDiff.diffSentences
    let diff = DiffMethod(value, modifiedValue);
    let display = document.createElement('div'),
        fragment = document.createDocumentFragment();

    diff.forEach(function(part)
    {
      spanClass = part.added ? 'added' : part.removed ? 'removed' : 'equals';
      span = document.createElement('span');
      if (spanClass) span.className = spanClass;
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    display.appendChild(fragment);

    return display.innerHTML;
  }

  getDiffOptionValues(optionValues : OptionValue[], newOptionValues : OptionValue[])
  {
    let diffOptionsValues = [];
    let newOVIds = newOptionValues.map((obj) => obj.optionId);
    let oldOVIds = optionValues.map((obj) => obj.optionId);

    for(let ov of optionValues)
    {
      if (newOVIds.indexOf(ov.optionId) == -1)
      {
        ov.diff = 'removed';
        diffOptionsValues.push(ov);
      }
    }
    for(let newOv of newOptionValues)
    {
      let index = oldOVIds.indexOf(newOv.optionId);
      if (index == -1)
      {
        newOv.diff = 'added';
      }
      else
      {        
        let modifiedValue = capitalize(newOv.description);
        let value = capitalize(optionValues[index].description),
        spanClass = '',
        span = null;
        let diff = JsDiff.diffWords(value, modifiedValue),
            display = document.createElement('div'),
            fragment = document.createDocumentFragment();

        diff.forEach(function(part)
        {
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