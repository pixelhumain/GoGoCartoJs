Hello my custom template
===================

{{ description|gogo_textarea(truncate = 400, glossary = {'proposer': 'Un glossaire','short': 'Petite'}) }}

**Created at : {{ createdAt }}**
{{ blop|gogo_tags }}
_________________

{{ taxonomy|gogo_taxonomy}}