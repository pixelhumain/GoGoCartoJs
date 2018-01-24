Advanced Taxonomy
============


Using Catgegories
---------------

A category is a container for grouping options.

![alt img](images/option-category-simple.jpg "Grouping options")

In this example, we have 2 categories : Services and Véhicules. Each categorie have sub-options. The taxonomy json is

```javascript
{
  "subcategories":[
    {
      // Category "Services", used for coloring the marker, but not for the icon
      "name":"Services",
      "options":[
        { "name":"Atelier/Réparation", "color":"#009a9c" },
        { "name":"Location",           "color":"#ab0061" },
        { "name":"Vente/Boutique",     "color":"#8e36a5" },
        { "name":"Nettoyage",          "color":"#00537e" }
      ]
    },
    {
      // Category "Services", used for icons
      "name":"Véhicules",
      "options":[
        { "name":"Vélo",   "icon":"icon-bike" },
        { "name":"Moto",   "icon":"icon-moto" },
        { "name":"Auto",   "icon":"icon-car" },
        { "name":"Bateau", "icon":"icon-boat" },
        { "name":"Autre",  "icon":"icon-skate" }
      ]
    }
  ]
}
```

We can see that the options of the first category "Services" are used to choose the color of the marker. The second category is used to choose the icon of the marker.
