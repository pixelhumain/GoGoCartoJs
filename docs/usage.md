Usage
=====

Initialization
-------------
You need to provide a configuration object to initialize GoGoCartoJs.

You can give a plain object, or an url to a json distant configuration
```javascript
myGogocarto = goGoCarto('#gogocarto', {
  data: {
      taxonomy: "http://test.com/api/taxonomy",
      elementsApiUrl: "https://test.com/api/elements"
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
* Set the current user role : 
*    Anonymous -> 'anonymous' | 0, 
*    User -> 'user' | 1, 
*    Admin -> 'admin' | 2
* GoGoFeatures are controlled depending on role (see Configuration)
* Login is not managed by GoGoCartoJs
*/
myGogocarto.setUserRole('admin');
myGogocarto.setUserMail('adminb@gogo.fr')
```
```javascript
/* Control the menu from an outside button */
myGogocarto.showDirectoryMenu() 
myGogocarto.hideDirectoryMenu() 
```
