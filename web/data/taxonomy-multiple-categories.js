var taxonomy = [
  {
    // Category "Services", used for coloring the marker, but not for picking the icon
    "name":"Services",
    "displayInInfoBar": true,         
    "options":[
      {
        "name":"Atelier/Réparation",
        "color":"#009a9c",
        "softColor":"#138c8e"
      },
      {
        "name":"Location",
        "color":"#ab0061",
        "softColor":"#a4307c"
      },
      {
        "name":"Vente/Boutique",
        "color":"#8e36a5",
        "softColor":"#7d398d"
      },
      {
        "name":"Nettoyage",
        "color":"#00537e",
        "softColor":"#22698e"
      }
    ]
  },
  {
    // Category "Vehicules", used for icons
    "name":"Véhicules",
    "displayInInfoBar": true,     
    "isMandatory": false,
    "options":[
      {
        "name":"Vélo",
        "icon":"icon-bike"
      },
      {
        "name":"Moto",
        "icon":"icon-moto"
      },
      {
        "name":"Auto",
        "icon":"icon-car"
      },
      {
        "name":"Bateau",
        "icon":"icon-boat"
      },
      {
        "name":"Autre",
        "icon":"icon-skate"
      }
    ]
  }
]