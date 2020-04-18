import { parseUriId } from '../../utils/string-helpers';

export class TaxonomySkosModule {
  concepts = [];

  convertSkosIntoGoGoTaxonomy($skosJson) {
    this.concepts = $skosJson['@graph'];
    const rootConcepts = this.concepts.filter((concept) => !concept.broader);
    const categories = [];

    for (const rootConcept of rootConcepts) {
      categories.push(this.rootSkosToGoGoCategory(rootConcept));
    }

    const gogoTaxonomy = {
      options: [
        {
          name: 'Racine',
          displayInInfoBar: false,
          displayInMenu: false,
          showExpanded: true,
          subcategories: categories,
        },
      ],
    };

    console.log('Taxonomy Tree', gogoTaxonomy);
    return gogoTaxonomy;
  }

  private rootSkosToGoGoCategory($skosJson) {
    $skosJson.id = $skosJson['@id'];
    $skosJson.name = $skosJson['prefLabel'];
    $skosJson.displayInMenu = false;
    $skosJson.displayInInfoBar = false;
    $skosJson.showExpanded = true;
    $skosJson.suboptions = this.recursivelyCreateSubOptionOf($skosJson);

    return {
      name: $skosJson['prefLabel'],
      showExpanded: true,
      isRootCategory: true,
      unexpandable: true,
      options: [$skosJson],
    };
  }

  private getSubConceptOf(conceptId) {
    return this.concepts.filter((concept) => concept.broader == conceptId);
  }

  private recursivelyCreateSubOptionOf(currentConcept) {
    const subConceptsToAdd = this.getSubConceptOf(currentConcept['@id']);
    const options = [];
    for (const concept of subConceptsToAdd) {
      const gogoNode = this.skosToGoGoOption(concept);
      const suboptions = this.recursivelyCreateSubOptionOf(concept);
      if (suboptions.length > 0) gogoNode.suboptions = suboptions;
      options.push(gogoNode);
    }
    return options;
  }

  private skosToGoGoOption($skosJson) {
    $skosJson.id = parseUriId($skosJson['@id']);
    $skosJson.name = $skosJson['prefLabel'];
    return $skosJson;
  }
}
