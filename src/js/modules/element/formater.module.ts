import { ElementBase, ElementStatus } from '../../classes/classes'; 
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

var capitalizeConfiguration =
{
  name: true,
  description: true,
  longDescription: true,
  address: false,
  telephone: false,
  website: false,
  email: false,
  openHoursMoreInfos: true,
}

export class ElementFormaterModule
{
  getFormatedTel(value)
  {
    if (!value) return '';
    if (value.length == 10) return value.replace(/(.{2})(?!$)/g,"$1 ");
    return value;
  }  

  calculateFormatedOpenHours(element : ElementBase)
  {         
    element.formatedOpenHours = {};
    element.openHoursDays = [];
    let new_key, new_key_translated, newDailySlot;
    for(let key in element.openHours)
    {
      new_key_translated = this.translateDayKey(key);        
      newDailySlot = this.formateDailyTimeSlot(element.openHours[key]);
      
      if (newDailySlot)
      {
        element.formatedOpenHours[new_key_translated] = newDailySlot;
        element.openHoursDays.push(new_key_translated);
      }
    }
  };

  getProperty(element : ElementBase, propertyName)
  {
    let value = this.getFormatedValue(element, propertyName);
    
    // in iframe the pending modifications are not displayed, just the old version
    if (element.status != ElementStatus.PendingModification || !App.config.isFeatureAvailable('pending') || !element.modifiedElement) return value;

    let modifiedValue = this.getFormatedValue(element.modifiedElement, propertyName);

    if (!value && !modifiedValue) return '';

    value = value || '';
    modifiedValue = modifiedValue || '';

    return App.elementDiffModule.getDiffValue(value, modifiedValue, propertyName)
  }

  private translateDayKey(dayKey)
  {
    switch(dayKey)
    {
      case 'Mo': return 'lundi';
      case 'Tu': return 'mardi';
      case 'We': return 'mercredi';
      case 'Th': return 'jeudi';
      case 'Fr': return 'vendredi';
      case 'Sa': return 'samedi';
      case 'Su': return 'dimanche';
    }

    return '';
  }

  private formateDailyTimeSlot(dailySlot) 
  {    
    if (dailySlot === null)
    {    
      //return 'fermé';
      return null;
    }
    let result = '';
    return dailySlot.replace(/-/g, ' - ').replace(/,/g, ' et ');
  };   

  private getFormatedValue(element : ElementBase, propertyName)
  {
    let value;
    if (propertyName == 'address') value = element.address.getFormatedAddress();
    else value = element[propertyName]
    
    value = capitalizeConfiguration[propertyName] ? capitalize(value) : value;
    return value;
  }
}