Info Bar Templates
===============

A template allow you to customize the rendering of the Info Bar. 

Templates can use [Markdown syntax](https://commonmark.org/help/) and/or a [Nunjucks syntax](https://mozilla.github.io/nunjucks/templating.html).
Templates can access all the attributes of an element with the syntax {% raw %}{{ myAttribute }}{% endraw %}


Examples
------

Given this element

```javascript
{
  // Mandatory fields
  "title": "GoGo Example",
  "geo": {
    "latitude":46.3252,
    "longitude":-0.0339
  },
  "taxonomy": [ 10427, 'Market' ],

  // Custom fields (can be any)
  "createdAt": "01/05/2018",
  "motivation": "Suspendisse at placerat nunc. Nam quis rhoncus est, eget aliquam lorem."
}
```

If I do not provide a custom template, then the result will be

![](images/templates/empty.png)

Not very satisfying ! It is just using the title and the taxonomy attributes. So we will now use this custom body template

```
## Hello my custom template

{% raw %}{{ motivation }}{% endraw %}

**Created at : {% raw %}{{ createdAt }}{% endraw %}**
___________

{% raw %}{{ taxonomy|gogo_taxonomy }}
```
![](images/templates/body.png)

You can see that I used some mardown syntax (heading, bold, and horizontal rule) and also I used the Nunjuck syntax for variables {% raw %}{{ myAttribute }}{% endraw %}.
For the attribute taxonomy, I used a special filter called "gogo_taxonomy", see list of filters below.

How to provide custom template to the configuration
-----------------------

From the above example, there is three options

**Option 1** : inline
```javascript
"infobar": {
    "bodyTemplate": {
      "content": "## Hello my custom template\n{% raw %}{{ motivation }}{% endraw %}\n**Created at : {% raw %}{{ createdAt }}{% endraw %}**\n_________\n{% raw %}{{ taxonomy|gogo_taxonomy}}{% endraw %}",
    },
  }
```

**Option 2** : string array
```javascript
"infobar": {
    "bodyTemplate": {
      "content": [
        "## Hello my custom template",
        "{% raw %}{{ motivation }}{% endraw %}",
        "",
        "**Created at : {% raw %}{{ createdAt }}{% endraw %}**",
        "____________",
        "{% raw %}{{ taxonomy|gogo_taxonomy}}{% endraw %}"
      ]
    }
  }
```

**Option 3** : file
```javascript
"infobar": {
    "bodyTemplate": { 
      "content": "http://path/to/custom-element-body-template.md",
      type: "url"
    },
  }
```

Header Template
----------

You can also customize the header template, for example

```javascript
"infobar": {
    "headerTemplate": {
      "content": "Motivation : {% raw %}{{ motivation }}{% endraw %}"
    }
    "bodyTemplate": { 
      "content": "http://path/to/custom-element-body-template.md",
      "type": "url"
    },
  }
```

![](images/templates/header.png)


Filters
-------

Nunjucks come with some builtin filters, see [Documentation](https://mozilla.github.io/nunjucks/templating.html#builtin-filters)

GoGoCarto has also some custom filters

**gogo_taxonomy** Use it with the taxonomy atribute `{% raw %}{{ taxonomy|gogo_taxonomy}}{% endraw %}`

**gogo_textarea(truncate = 400)** This is used to display long text. There is an optional parameter called truncate which truncate the texte around the given character length and add a "display more" button 

```
{% raw %}{{ motivation|gogo_textarea(truncate = 400){% endraw %} }}
```

![](images/templates/gogo-textarea-truncate.png)

**gogo_url** Display urls

**gogo_email** Depending on configuration, it can hide the email and display a "Send Mail" button instead

**gogo_tags** display an array attributes 
```javascript
{
  // ...
  "blop": ["Open Source", "Réutilisable", "Awesome!"]
}
```
```
{% raw %}{{ blop|gogo_tags }}{% endraw %}
```

![](images/templates/gogo-tags.png)
