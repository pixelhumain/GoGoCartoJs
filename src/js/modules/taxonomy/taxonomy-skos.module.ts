export class TaxonomySkosModule
{
  concepts = [];

  convertSkosIntoGoGoTaxonomy($skosJson)
  {
    this.concepts = $skosJson['@graph'];

    // roots are concepts which don't have broader (no parent)
    // let rootsConcepts = this.concepts.filter( (concept) => !concept.broader);  

    // let mainCategories = [];

    // for(let rootConcept of rootsConcepts)
    // {
    //   mainCategories.push({
    //     "name": rootConcept["skos:prefLabel"],
    //     "showExpanded": mainCategories.length == 0, // only expand first root concept
    //     "options" : this.recursivelyCreateSubOptionOf(rootConcept)
    //   })
    // }

    // let gogoTaxonomy = {
    //   "subcategories": mainCategories
    // };

    let rootConcept = this.concepts.filter( (concept) => concept["@id"] == "http://PWA/SKOS/domaine")[0];

    let gogoTaxonomy = {
      name: rootConcept["skos:prefLabel"],
      showExpanded: true,
      unexpandable: true,
      options : this.recursivelyCreateSubOptionOf(rootConcept)
    };            

    console.log("TREE", gogoTaxonomy);

    return gogoTaxonomy;
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

  private skosToGoGoOption($skosJson) {
    let result : any = {
      id: $skosJson["@id"].split("http://PWA/SKOS/")[1],
      name: $skosJson["skos:prefLabel"],
    }

    if ($skosJson.markerAndIcons && $skosJson.markerAndIcons.length > 0) {
      if ($skosJson.markerAndIcons[0].color) result.color = $skosJson.markerAndIcons[0].color;
      if ($skosJson.markerAndIcons[0].icon)  result.icon  = `fa fa-${$skosJson.markerAndIcons[0].icon}`;
    }
    
    return result;
  }
}