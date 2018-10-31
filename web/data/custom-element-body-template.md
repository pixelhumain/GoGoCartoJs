Hello my custom template
===================

{{ motivation|gogo_textarea(truncate = 400) }}

**Created at : {{ createdAt }}**
{% set ar = ["Hello", "Awesome", "GoGoCarto"] %}
{{ blop|gogo_tags }}
_________________

{{ taxonomy|gogo_taxonomy}}