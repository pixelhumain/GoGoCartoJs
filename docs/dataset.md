Dataset
==
You needs to provide data that gogocarto will display on the map. The data must be an array of json objects. See [Element Documentation](dataset-element-configuration.md) to know how each element must look like.

There is three ways of giving the data

With Local Object
-----

```html
<!-- Load data -->
<script src="../data/elements.js"></script>
<script src="../data/taxonomy-without-category.js"></script>

<body><div id="gogocarto"></div></body>

<script>
  $(document).ready(function()
  {   
    carto = goGoCarto('#gogocarto', {
      data:
      {
        taxonomy: taxonomy,
        elements: elements,
      }
    });
  });
</script>  
```

With distant Object, all at a time
-----------
```javascript
data:
{
  taxonomy: "https://pixelhumain.github.io/GoGoCartoJs/web/data/taxonomy.json",
  elements: "https://pixelhumain.github.io/GoGoCartoJs/web/data/elements.json",
}
```

With distant API, and bounds queries
--------------------

For large dataset, it is strongly recommanded to use an API which will only send the data needed by GoGocarto.

To use this feature, just add the **requestByBounds** option in the config

```javascript
data:
{
  taxonomy: "https://pixelhumain.github.io/GoGoCartoJs/web/data/taxonomy.json",
  elements: "https://pixelhumain.github.io/GoGoCartoJs/web/data/elements.json",
  requestByBounds: true,
}
```

Whenever GoGoCarto needs elements, it will call the given API with the followings params

**mainOptionId** : If you are using the `showOnePanePerMainOption` option (see [Configuration documentation](configuration.md)) the Id of the current MainOption is sent. In this case, you would prefer send only the elements which are linked to this main option

**boundsJson** : An array of bounds object. A bounds is a rectangle defined with two points : southWest and northEast corners.
A single bounds looks like
```json
{
  "_southWest": {
    "lat": 42.61779,
    "lng": -3.38379
  },
  "_northEast": {
    "lat": 49.89463,
    "lng": 5.20752
  }
}
```
Remember, the **boundsJson is an array of bounds** (up to 4 bounds requested at a time)
```json
[
  {
    "_southWest": {
      "lat": 49.89463,
      "lng": -6.81152
    },
    "_northEast": {
      "lat": 53.24943,
      "lng": 5.20752
    }
  },
  {
    "_southWest": {
      "lat": 38.60909,
      "lng": 5.20752
    },
    "_northEast": {
      "lat": 53.24943,
      "lng": 10.37109
    }
  }
]
```



