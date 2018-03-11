import { parseUriId } from "../../utils/string-helpers";

export class TaxonomySkosModule
{
  concepts = [];

  convertSkosIntoGoGoTaxonomy($skosJson)
  {
    this.concepts = $skosJson['@graph'];
    let rootConcepts = this.concepts.filter( (concept) => !concept.broader);
    let categories = [];

    for(let rootConcept of rootConcepts)
    {
      categories.push(this.rootSkosToGoGoCategory(rootConcept, rootConcepts.length == 1));
    }  

    let gogoTaxonomy = {
      "options":[    
        {
          "name":"Racine",
          "rootOption": true,
          "disableInInfoBar": true,
          "displayOption": false,
          "showExpanded": true,
          "subcategories": categories,
        }
      ]
    };     

    console.log("Taxonomy Tree", gogoTaxonomy);

    return gogoTaxonomy;
  }

  private rootSkosToGoGoCategory($skosJson, $unexpandable)
  {
    return {
      name: $skosJson["prefLabel"],
      showExpanded: true,
      rootCategory: true,
      unexpandable: $unexpandable,
      options : [{
        name: $skosJson["prefLabel"],
        displayOption: false,
        disableInInfoBar: true,
        showExpanded: true,
        suboptions: this.recursivelyCreateSubOptionOf($skosJson)
      }]
    }
  }

  private getSubConceptOf(conceptId)
  {
    return this.concepts.filter( (concept) => concept.broader == conceptId);
  }

  private recursivelyCreateSubOptionOf(currentConcept)
  {
    let subConceptsToAdd = this.getSubConceptOf(currentConcept['@id']);
    let options = [];
    for(let concept of subConceptsToAdd) 
    {
      let gogoNode = this.skosToGoGoOption(concept);
      let suboptions = this.recursivelyCreateSubOptionOf(concept);
      if (suboptions.length > 0) gogoNode.suboptions = suboptions;
      options.push(gogoNode);
    }
    return options;
  }

  private skosToGoGoOption($skosJson) 
  {
    $skosJson.id = parseUriId($skosJson["@id"]);
    $skosJson.name = $skosJson["prefLabel"];    
    return $skosJson;
  }
}