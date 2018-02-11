Usage
=====

Import the library
----------

[Download latest release](https://github.com/pixelhumain/GoGoCartoJs/releases) and import both `gogocarto.css` and `gogocarto.js`. The folders "images" and "fonts" must remains in the same place than the `gogocarto.css` file.

```html
<link rel="stylesheet" href="path/to/gogocarto.min.css"> 
<script src="path/to/gogocarto.min.js"></script>
```

Initialization
-------------
You need to provide a configuration object to initialize GoGoCartoJs.

You can give a plain object, or an url to a json distant configuration
```html
<div id="gogocarto"></div>
```
```javascript
myGogocarto = goGoCarto('#gogocarto', {
  data: {
      taxonomy: "http://test.com/api/taxonomy",
      elements: "https://test.com/api/elements"
  });
```

```javascript
myGogocarto = goGoCarto("#gogocarto", "https://gist.github.com/seballot/27c005421d0a7a4c293dd87fe9856bfd");
```
__Look at the [Taxonomy](taxonomy.md) and [Dataset](dataset.md) to know how thoses objects/APIs must look like.__

Please visit [Configuration](configuration.md) to know more about all configuration available

Interaction with component
-------------------------

Once component instanciated, you can interact with him with the current methods

```javascript
/** 
* Set the current user roles. Array of strings
* GoGoFeatures are controlled depending on role (see Configuration)
* Login is not managed by GoGoCartoJs
*/
myGogocarto.setUserRoles(['admin']);
myGogocarto.setUserEmail('adminb@gogo.fr')
```
```javascript
/* Control the menu from an outside button */
myGogocarto.showDirectoryMenu() 
myGogocarto.hideDirectoryMenu() 
```
