Application main behaviour
====================

Managing Elements To display
--------------

Every time something occurs on the app which will impact the elements displayed, the following actions take place :

1. Handle a change like filter checked, map move...
2. Starting the global main process -> `App.ElementsManager.checkForNewElementsToRetrieve`
3. If necessary, retrieve some new elements from the server that we havn't yet downloaded
4. Update the array of elements which need to be shown according to current geographical zone, filters etc... -> `App.elementsModule.updateElementsToDisplay`
5. Update the view according to the new ElementsToDisplay array -> `App.ElementsManager.handleElementsToDisplayChanged`

Retrieve partial data
-----------------

For large dataset, it's better not retrieving all the elements in one shot. Instead we prefer retrieve element on a particular geographical zone (called a `Bound`), one after another. Here is are the detailled actions from the above task : "If necessary, retrieve some new elements from the server that we havn't yet downloaded" :

1. Calculating the geographical zone where we havn't retrieved the proper data yet -> `App.boundsModule.calculateFreeBounds`
2. Retrieve the data for this geographical zone -> `App.ajaxModule.getElementsInBounds`
3. Receive the JSON object containing the elements -> `App.ElementManagers.handleNewElementsReceivedFromServer`
4. Transform the JSON data into proper `Element` classes -> `App.elementsJsonModule.convertJsonElements`

