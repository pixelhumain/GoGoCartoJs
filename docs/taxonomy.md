Taxonomy
========

Two concept are used in GoGoCarto : **Categories** and **Options**. They are organized in a big tree, where category have many options and options have many subcategories.

- Categories are kind of options container. It's just an help to organize the options as we want
- Options are the main concept
- An element have many Options. An element don't have category

Let's take an example, from https://presdecheznous.fr/annuaire

We are interested in organizations involved in Mobility

```javascript
{  
  "name": "Categories Principales",  
  
  "options": [
    { "name": "Agriculture", ... }, // see option detaails below
    { "name": "Education",  ... },
    { "name": "Habitat",  ... },
    { "name": "Mobilité",  ... },  
  ],
  
  // other optional fields
  "id": 2157,
  "index": 1,
  "displayCategoryName": true,
  "depth": 0,
  "showExpanded": true,
  "unexpandable": true,
}
```
The Mobility Option
```json
{
  "id": 10427,
  "name": "Mobilité",
  "icon": "icon-plane",
  "color": "#AB7100",
  "useIconForMarker": true,
  "useColorForMarker": true,
  
  "subcategories": [
    { "name": "Services", ... },
    { "name": "Vehicules", ... },
  ],
  
  "nameShort": "Agriculture",      
  "index": 7, 
  "softColor": "#9D7424",  
  "textHelper": "",  
  "displayOption": true,
  "showExpanded": false,  
}
```
