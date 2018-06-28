Element Configuration
========
Here the basic attributes of an element

```javascript
{
  "id": "wd40",

  "title": "GoGo Example",

  "geo": {
    "latitude":46.3252,
    "longitude":-0.0339
  },

  "taxonomy": [ 10427, 'Market' ],

  "address": {
    "streetAddress":"5 rue Edmond Proust",
    "addressLocality":"Chenay",
    "postalCode":"79120",
    "addressCountry":"FR"
  },

  "image": "http://my.image.fr/06",

  "description": "Short Description",
  "descriptionMore": "Additionnal Longer Description",

  "email": "example@gogocarto.fr",
  "telephone": "055452545",
  "website": "https://example.fr",

  "openHours": {
    "Mo":"09:00-12:00",
    "Fr":"09:00-11:30 & 5pm to 9pm"
  },
  "openHoursString": "Fermé pendant les vacances d'été",
}
```

Id
---
Can be a number, a string, or can be blank (automatcally created)

Title
-----
Title of the Element. displayed on marker hover, and on top of the Element info bar.

Taxonomy
----
An array of Ids. The Ids can be number or string. Those Ids must be the same than the one given in the Taxonomy, for an element to be linked with various options

Address
-------
You can simply provide a string
```javascript
  address: "12 rue Chanzy, 40400 Tartas"
```
Or an object
```
 "address": {
    "streetAddress":"5 rue Edmond Proust",
    "addressLocality":"Chenay",
    "postalCode":"79120",
    "addressCountry":"FR",
    "customFormatedAddress": "Immeuble 4B, 5 Edmond Proust à Chenay, France"
 },
 ```
 The postalCode and addresLocality are used in the List mode to display an overview of the location.
 
 The formated address is build as following : "{streetAddress}, {postalCode} {addressLocality}". If you want you can overwrite this giving a "customFormatedAddress"

Image
-----
Url to an image that ill be diplayed in theelement info bar

Description
-----
Description of the element. Must be short (less than 300 characters) for better display

Descritpion More
---------
Complete the short description with a longer one. The DescritpionMore is display below the Description, a bit less visible.

Open Hours
--------
An object day/value. Each key corrspond to a 2 letter day : Mo, Tu, We, Th, Fr, Sa, Sun. The value is a string

Open Hours String
---------------
A string put below Open Hours
