var taxonomy = {
  "@context": {
    "broader": {
      "@id": "skos:broader",
      "@type": "@id"
    },
    "skos": "http://www.w3.org/2004/02/skos/core#"
  },
  "@graph": [
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "domaines",
      "markerAndIcons": [
        {
          "color": "",
          "icon": ""
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/0dechet",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "fabriquer, réparer, zéro déchets",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/ressourcerie",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "ressourceries",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/récup",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "récup",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/biffin",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "biffins",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    }
  ]
}