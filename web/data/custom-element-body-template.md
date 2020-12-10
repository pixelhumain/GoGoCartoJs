Hello my custom template
===================

{{ email|gogo_email(label = 'Mon email')}}
{{ telephone|gogo_tel(label = 'Mon téléphone')}}
{{ website|gogo_url(label = 'Site web') }}
{{ createdAt|gogo_text(label = 'Created At') }}

{{ description|gogo_textarea(label = 'Description') }}

{{ blop|gogo_tags }}
{{ friends|gogo_elements}}
_________________

{{ taxonomy|gogo_taxonomy}}