Hello my custom template
===================

{{ description|gogo_textarea(glossary = {'description': 'test de tooltipe un peu longue'}) }}

**Created at : {{ createdAt }}**
{{ blop|gogo_tags }}
{{ friends|gogo_elements}}
_________________

{{ taxonomy|gogo_taxonomy}}