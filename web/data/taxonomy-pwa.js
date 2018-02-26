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
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/troc",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "troc",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/don",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "don",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/fablabs",
      "broader": "http://PWA/SKOS/0dechet",
      "skos:prefLabel": "fablabs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "recycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/nourriture",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "agriculture et alimentation",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/magasin",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "magasins bio",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/amap",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "amap",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/producteur",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "producteurs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/jardin_partage",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "jardins partagés (biens communs)",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/permaculture",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "permaculture",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/agriculture_urbaine",
      "broader": "http://PWA/SKOS/nourriture",
      "skos:prefLabel": "agriculture urbaine",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "cutlery"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/culture",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "culture",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "music"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/cafe",
      "broader": "http://PWA/SKOS/culture",
      "skos:prefLabel": "cafés lecture/débat",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "music"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/spectacle",
      "broader": "http://PWA/SKOS/culture",
      "skos:prefLabel": "spectacles alternatifs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "music"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/production_artist",
      "broader": "http://PWA/SKOS/culture",
      "skos:prefLabel": "productions artistiques",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "music"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/nature",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Eau, nature et biodiversité",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "leaf"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/guerilla_gardening",
      "broader": "http://PWA/SKOS/nature",
      "skos:prefLabel": "guerilla gardening",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "leaf"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/protection",
      "broader": "http://PWA/SKOS/nature",
      "skos:prefLabel": "protection espèces",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "leaf"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/nettoyage",
      "broader": "http://PWA/SKOS/nature",
      "skos:prefLabel": "associations nettoyage/ramassage",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "leaf"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/citoyennete",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Citoyenneté, droits",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/participation",
      "broader": "http://PWA/SKOS/citoyennete",
      "skos:prefLabel": "participation citoyenne",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/egaliteHF",
      "broader": "http://PWA/SKOS/citoyennete",
      "skos:prefLabel": "égalité homme-femme",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/agire",
      "broader": "http://PWA/SKOS/citoyennete",
      "skos:prefLabel": "pouvoir d'agir",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/protectionDH",
      "broader": "http://PWA/SKOS/citoyennete",
      "skos:prefLabel": "protection des droits humains",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/agora",
      "broader": "http://PWA/SKOS/citoyennete",
      "skos:prefLabel": "agoras ouvertes (Nuit Debout etc)",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "legal"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/solidarite",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Solidarité et migrations",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "universal-access"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/bourse_travaille",
      "broader": "http://PWA/SKOS/solidarite",
      "skos:prefLabel": "bourses du travail",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "universal-access"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/migrant",
      "broader": "http://PWA/SKOS/solidarite",
      "skos:prefLabel": "lieux d'aides aux migrants",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "universal-access"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/energie",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Climat et énergie",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bolt"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/cooperative_production",
      "broader": "http://PWA/SKOS/energie",
      "skos:prefLabel": "Enercoop",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bolt"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/ENR_citoyen",
      "broader": "http://PWA/SKOS/energie",
      "skos:prefLabel": "projets d'énergies renouvelables citoyennes",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bolt"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/esapce_info_energie",
      "broader": "http://PWA/SKOS/energie",
      "skos:prefLabel": "espaces infos énergie",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bolt"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/economie",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Economie soutenable",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "eur"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/monnaie",
      "broader": "http://PWA/SKOS/economie",
      "skos:prefLabel": "monnaies",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "eur"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/SEL",
      "broader": "http://PWA/SKOS/economie",
      "skos:prefLabel": "SEL/accorderies",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "eur"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/revenue_base",
      "broader": "http://PWA/SKOS/economie",
      "skos:prefLabel": "revenu de base",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "eur"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/echange",
      "broader": "http://PWA/SKOS/economie",
      "skos:prefLabel": "reseaux d'échanges",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "eur"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/education",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Education pour tous",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "university"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/education_environnement",
      "broader": "http://PWA/SKOS/education",
      "skos:prefLabel": "éducation à l'environnement",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "university"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/ecole_alternative",
      "broader": "http://PWA/SKOS/education",
      "skos:prefLabel": "écoles alternatives",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "university"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/mobilite",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Transports/mobilités",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bicycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/voyage",
      "broader": "http://PWA/SKOS/mobilite",
      "skos:prefLabel": "voyager autrement",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bicycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/velo",
      "broader": "http://PWA/SKOS/mobilite",
      "skos:prefLabel": "vélo",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bicycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/pieton",
      "broader": "http://PWA/SKOS/mobilite",
      "skos:prefLabel": "piétons",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bicycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/transport_commun",
      "broader": "http://PWA/SKOS/mobilite",
      "skos:prefLabel": "transports en commun",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "bicycle"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/habitat",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Habitat et urbanisme",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/habitat_participatif",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "habitats participatifs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/territoire_transition",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "territoires en transition",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/eco_consctruction",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "éco-construction",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/squat",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "squats",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/materiau",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "matériaux et auto-construction",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/renovation",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "rénovation",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/mal_logement",
      "broader": "http://PWA/SKOS/habitat",
      "skos:prefLabel": "mal logement et aide au logement",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "building-o"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/sante",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "sante",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "heart"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/media_numerique",
      "broader": "http://PWA/SKOS/domaine",
      "skos:prefLabel": "Médias et numérique",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "television"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/media_alternatif",
      "broader": "http://PWA/SKOS/media_numerique",
      "skos:prefLabel": "médias alternatifs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "television"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/antipub",
      "broader": "http://PWA/SKOS/media_numerique",
      "skos:prefLabel": "antipub",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "television"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/hacklab",
      "broader": "http://PWA/SKOS/media_numerique",
      "skos:prefLabel": "hacklabs",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "television"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/source",
      "skos:prefLabel": "sources",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": ""
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/alternatiba",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "Alternatiba",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/campanule",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "Campanule (Pays d'ancenis)",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/italia che cambia",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "italia che cambia",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/rede convergir",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "rede convergir",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/PresDeChezNous",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "Pres De Chez Nous",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/CRID",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "CRID",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    },
    {
      "@type": "skos:Concept",
      "@id": "http://PWA/SKOS/utopia",
      "broader": "http://PWA/SKOS/source",
      "skos:prefLabel": "Mouvement Utopia",
      "markerAndIcons": [
        {
          "color": "grey",
          "icon": "podcast"
        }
      ]
    }
  ]
}