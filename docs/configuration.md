GoGoConfig
========

GoGoCarto is higly configurable, let's discover all the configurations options

Data
---
See [Taxonomy](taxonomy.md) and [Dataset](dataset.md) documentation.

```javascript
"data": {
  "taxonomy": "https://pixelhumain.github.io/GoGoCartoJs/web/data/taxonomy.json",
  "elements": "https://pixelhumain.github.io/GoGoCartoJs/web/data/elements.json",
  "requestByBounds": false
},
```
Menu
------
```javascript
"menu": {
  "showOnePanePerMainOption": false,
  "showCheckboxForMainFilterPane": true, // you can hide the checkboxes for a lighter design
  "showCheckboxForSubFilterPane": true
},
```
If your taxonomy is complex, you should better use the option "showOnePanePerMainOption". 
It will add a vertical side bar with all the main option icons. clicking each main option icon will show a diferent pane 
for each main option children.
[Check OneFilterPanePerMainOption Demo](https://pixelhumain.github.io/GoGoCartoJs/web/examples/index-full-taxonomy.html#/carte/@45.94,-0.38,10z?cat=all) 


Texts
------
```javascript
"text": {
  "element": "organisation",
  "elementDefinite": "l'organisation",
  "elementIndefinite": "une organisation",
  "elementPlural": "organisations"
},
```
Custom text to label the elements of the dataset.

Map
------
```javascript
"map": {
  "defaultBounds": {
    "_southWest": { "lat": 40, "lng": -5 },
    "_northEast": { "lat": 52, "lng": 10 }
  },
  "defaultCenter": { "lat": 46, "lng": 0 },
  "maxBounds": {
    "_southWest": { "lat": -90, "lng": -180 }, 
    "_northEast": { "lat": 90, "lng": 180 }
  },
  "saveViewportInCookies": false,
  "saveTileLayerInCookies": false,
  "defaultTileLayer": "cartodb",
  "tileLayers": [
    {
      "name": "cartodb",
      "url": "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      "attribution": "© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>"
    },
    {
      "name": "wikimedia",
      "url": "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png",
      "attribution": "© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>"
    },
  ]
},
```
**DefaultBounds** and **DefautCenter** are used for the initial map state.
**MaxBounds** is used to prevent loading elements outside of this bounds

Features
------
```javascript
"features": {
  "favorite": 
  "share": 
  "directions": 
  "sendMail": 
  "elementHistory": 
  "listMode": 
  "export": 
  "layers": 
  "mapdefaultview": 
  
  "pending": 
  "searchPlace":
  "searchElements": 
  "searchGeolocate": 
  "edit": 
  "delete": 
  "report": 
  "vote": 
  "moderation":
  "directModeration": 
},
```

Security
------
```javascript
"security": {
  "userRole": "user",
  "userEmail": "test@gt.gt",
  "hideMailsByShowingSendMailButton": true
},
```
**userRole** is used to know is the current user can access different features.
**userEmail** is used to prefill some interaction modals, like "report error", or "send mail".
To set dynamically **userRole** and "userEmail", please check [How to interact with Component](usage.md)

Colors
------
```javascript
"colors": {
  "neutralDark": "#354254",
  "neutralDarkTransparent": "rgba(53, 66, 84, 0.9)",
  "neutralSoftDark": "#5c6c86",
  "neutral": "#6b7e9b",
  "neutralLight": "#f4f4f4",
  "secondary": "#bdc900",
  "primary": "#bd2d86",
  "background": "#f4f4f4",
  "textColor": "#354254",
  "disableColor": "#c2c9d4",
  "listTitle": "#bd2d86", // the title header on top of list view
  "listTitleBackBtn": "#354254",
  "listTitleBackground": "#f4f4f4",
  "mainFont": "Roboto",
  "titleFont": "Lobster",
  "taxonomyMainTitleFont": "Lobster"
}
```
If you want to use custom font (such as "Lobster"), don't forget to load this font with an external file !

