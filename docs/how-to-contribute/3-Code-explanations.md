How does it Work?
================

Instanciating a map with `goGoCarto('#gogocarto', myConfig)` will create a `GoGoCartoModule` which 
1. Loads the configuration
2. Renders the main template (layout) and inserts it into the specified DOM
3. Instanciates `AppModule`
4. Initializes some modules and components
(see src/js/gogocarto.ts)

`AppModule` is a kind of "One ring to rule them all". Every components, modules and managers belongs to `AppModule`.
AppModule is accessible everywhere in the code calling the `App` variable.
For example, in the `MapComponent`, If I want to get the `BoundsModule`, I can do
```javascript
App.boundsModule.defaultBounds
```

Components, Modules, what is all of this ?

Components
--------
Components are responsible of a part of the UI.
Components have a javascript class, a view, and css style. For example the `MarkerComponent`
```
src/js/components/map/marker.component.ts
src/view/components/map/marker.html.njk
src/scss/components/map/_marker.scss
```

Some components, like `Marker` & `Element`, render their view on the fly.
But most part of the components are more "static", meaning their are instanciated once, and the view 
is rendered from the main layout.

The `AppComponent` is a bit special. Its purpose is to handle the main layout, and mostly resizes the visible components.

(See UI layout on next page)


Modules (src/js/modules)
------
A `Module` is a piece of code not linked to the view, who can performs various actions. 
In some frameworks, this kind of object is called a `Service`.

For example `AjaxModule` performs Ajax calls. One of the method is
```javascript
AjaxModule.getElementById(elementId, callbackSuccess?, callbackFailure?)
```


Managers (src/js/managers)
---------

Managers take care of linking components and modules between each others.
To say it differently, managers are responsibles for transverse actions.

Actually, with the global `App` variable, all modules and components can access to all others ones. 
But in practice, the use of `App` variable within a component or Module should remain for "reading" action, like
getting the value from an other component. But if a Component or a Module need to have an impact on others, it need to
go throw a Manager first.

For example, a Map Click should close a visible element infoBar. 
The map component will not hide the infoBar itself (it could, but it will not). Instead the MapManager is here to listen
for map click, and then performs the transverse actions, like `App.infoBarComponent.hide()`

*Managers should listen to components or modules events. This is the preferred way.*

But sometimes, to go faster, a component or a module can call directly a Manager.
This is the case for changing State, Mode or DataType (see below).
For example, the `GoGoControlComponent` has a `ShowAsListButton`. When this button is clicked, the `GoGoControlComponent`
will call `App.stateManager.setMode(AppModes.List);`

Also, when actions are very simple, a component can call an other one. 
For example the `GoGoControlComponent` has a `ShowDirectoryMenuButton`. When this button is clicked, the `GoGoControlComponent`
will call `App.directoryMenuComponent.show()`

Classes (src/js/classes)
--------
This folder contains all the classes who describe an Object, but without being a UI Component. 
For example a `TileLayer`, a `PostalAddress`
Thoses classes should not have business logic inside. This is more a descriptive object, with getters, setters
and methods to initialize or do basic operations

Continue with
--
[User Interface Layout](4-Ui-layout.md)
