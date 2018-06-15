Application state machine
=======================

Concept
------

Almost any action made on the application is saved in the browser history. You can directly see that by watching the change of the URL while you are navigating

For example :
- `index.html#/carte/@46.79,3.67,7z`
- `index.html#/liste/paris`
- `index.html#/liste/paris?cat=Habitat@+olb10455old`
- `index.html#/liste/recherche/biocoop`

The main properties to describe the current application state  (what we call an `HistoryState`) are
- **Viewport**. Actual map viewport
- **Address**. If an address has been localized
- **Filters**. Save the current checked/unchecked filters into a string like `?cat=Habitat@+olb10455old`
- **Mode**. For now it can be List or Map. We can imagine others mode of vizualization (Table...)
- **State**. Values are 
   - Normal // Standard state, all elements are visible
   - ShowElement // An element has been clicked and is visible
   - ShowElementAlone // A focus on an element, nothing else is shown
   - ShowDirections // A route is displayed to go from one point to the selected element
- **DataType**. Values are All and SearchResult

In the code
------------
There is an `HistoryState` class and an `HistoryModule` class to create and record the current `HistoryState`

The `RouterModule` loads the initial URL and parses it to determine the proper `HistoryState`

Mode, State and DataType are managed by a dedicated Manager (`src/js/managers/data-type.manager.ts` for example)



Continue with
----
[Application main behaviour](6-App-main-behaviour.md)
