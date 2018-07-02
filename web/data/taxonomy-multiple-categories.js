var taxonomy = {
  "options":[    
    {
      // Hiding the option so we can see directly the sub categories
      "id":10485,
      "name":"Mobilité",
      "displayInMenu": false,
      "showExpanded": true,
      "color":"#009A9C",
      "softColor":"#138C8E",
      "icon":"icon-mobilite-2",
      "subcategories":[
        {
          // Category "Services", used for coloring the marker, but not for picking the icon
          "name":"Services",          
          "options":[
            {
              "id":10486,
              "name":"Atelier/Réparation",
              "color":"#009a9c",
              "softColor":"#138c8e"
            },
            {
              "id":10487,
              "name":"Location",
              "color":"#ab0061",
              "softColor":"#a4307c"
            },
            {
              "id":10488,
              "name":"Vente/Boutique",
              "color":"#8e36a5",
              "softColor":"#7d398d"
            },
            {
              "id":10489,
              "name":"Nettoyage",
              "color":"#00537e",
              "softColor":"#22698e"
            }
          ]
        },
        {
          // Category "Vehicules", used for icons
          "name":"Véhicules",
          "isMandatory": false,
          "options":[
            {
              "id":10490,
              "name":"Vélo",
              "icon":"icon-bike"
            },
            {
              "id":10491,
              "name":"Moto",
              "icon":"icon-moto"
            },
            {
              "id":10492,
              "name":"Auto",
              "icon":"icon-car"
            },
            {
              "id":10493,
              "name":"Bateau",
              "icon":"icon-boat"
            },
            {
              "id":10494,
              "name":"Autre",
              "icon":"icon-skate"
            }
          ]
        }
      ],
    },
  ]  
}