GoGoCartoJs
==========
Create a configurable collaborative maps that rocks !

![alt text](docs/screenshots/desktop.png "Desktop")
.   .   ![alt text](docs/screenshots/mobile.png "Mobile")

Overview
--------

GoGoCartoJs is fast, ergonomic and responsive. 

It can be instanciated in few lines from a DOM element, a taxonomy (i.e. filters/categories) and a dataset (distant or local). Both taxonomy and data need to be JSON objects.

```javascript
carto = goGoCarto('#gogocarto', {
  data: {
      taxonomy: "http://test.com/api/taxonomy",
      elementsApiUrl: 'https://test.com/api/elements'
  });
```

Know more about all the [Features](docs/features.md) and the full [Configuration](docs/confiiguration.md)


Stack
-----
Typescript, Nunjucks templates, Leaflet, SASS, MaterializeCSS, Gulp


Want to Contribute ?
-------------

- [Installation intructions](docs/installation.md)
- [Coding conventions](docs/coding-conventions.md)
- [Code Explanations](docs/code-explanations.md)
