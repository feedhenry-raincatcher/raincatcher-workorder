# FeedHenry RainCatcher workorder [![Build Status](https://travis-ci.org/feedhenry-raincatcher/raincatcher-workorder.png)](https://travis-ci.org/feedhenry-raincatcher/raincatcher-workorder) [![Coverage Status](https://coveralls.io/repos/github/feedhenry-raincatcher/raincatcher-workorder/badge.svg?branch=master)](https://coveralls.io/github/feedhenry-raincatcher/raincatcher-workorder?branch=master)

This module contains a workorder model representation and its related services :
- Backend services
- Frontend services

## Client-side usage

### Setup
This module is packaged in a CommonJS format, exporting the name of the Angular namespace.  The module can be included in an angular.js as follows:

```javascript
angular.module('app', [
, require('fh-wfm-workorder')
...
])
```

### Integration

#### Angular controller
A sync manager must first be initialized using the `workorderSync.createManager()`.  This can be placed, for instance, in the `resolve` config of a `ui-router` controlled application.

```javascript
resolve: {
  workorderManager: function(workorderSync) {
    return workorderSync.createManager();
  }
}
```
For a more complete example, please check the [demo portal app](https://github.com/feedhenry-raincatcher/raincatcher-demo-portal/blob/master/src/app/main.js).


### Topic Subscriptions

#### wfm:workorders:create

##### Description

Creating a new Workorder

##### Example


```javascript
var parameters = {
  workorderToCreate: {
    //A Valid JSON Object
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:workorders:create", parameters);
```

#### wfm:workorders:read

##### Description

Read a single Workorder

##### Example


```javascript
var parameters = {
  id: "workorderId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:workorders:read", parameters);
```

#### wfm:workorders:update

##### Description

Update a single Workorder

##### Example


```javascript
var parameters = {
  workorderToUpdate: {
    ...
    id: "workorderId"
    ...
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:workorders:update", parameters);
```


#### wfm:workorders:remove

##### Description

Remove a single Workorder

##### Example


```javascript
var parameters = {
  id: "workorderId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:workorders:remove", parameters);
```


#### wfm:workorders:list

##### Description

List All Workorders

##### Example


```javascript
var parameters = {
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:workorders:list", parameters);
```


### Published Topics

The following topics are published by this module. Developers are free to implement these topics subscribers, or use a module that already has these subscribers implement (E.g. the [raincatcher-sync](https://github.com/feedhenry-raincatcher/raincatcher-sync) module).


| Topic         | Description           |
| ------------- |:-------------:| 
| wfm:sync:workorders:create              |   Create a new item in the sync `workorders` collection |
| wfm:sync:workorders:update              |   Update an existing item in the sync `workorders` collection |
| wfm:sync:workorders:list              |   List all items in the sync `workorders` collection |
| wfm:sync:workorders:remove              |   Remove an existing item from the sync `workorders` collection |
| wfm:sync:workorders:read              |   Read a single item from the sync `workorders` collection |
| wfm:sync:workorders:start              |   Start the sync process for sync `workorders` collection |
| wfm:sync:workorders:stop              |   Stop the sync process for sync `workorders` collection |
| wfm:sync:workorders:force_sync        |   Force a sync cycle from client to cloud for sync `workorders` collection |


### Topic Subscriptions

| Topic         | Description           |
| ------------- |:-------------:| 
| done:wfm:sync:workorders:create        |   A workorder was created in the `workorders` dataset |
| error:wfm:sync:workorders:create        |   An error occurred when creating an item in the `workorders` dataset. |
| done:wfm:sync:workorders:update        |   A workorder was updated in the `workorders` dataset |
| error:wfm:sync:workorders:update        |   An error occurred when updating an item in the `workorders` dataset. |
| done:wfm:sync:workorders:list        |   A list of the items in the `workorders` dataset completed |
| error:wfm:sync:workorders:list        |   An error occurred when listing items in the `workorders` dataset. |
| done:wfm:sync:workorders:remove        |   A workorder was removed from the `workorders` dataset |
| error:wfm:sync:workorders:remove        |   An error occurred when removing an item in the `workorders` dataset. |
| done:wfm:sync:workorders:read        |   A item was read correctly from the `workorders` dataset |
| error:wfm:sync:workorders:read        |   An error occurred when reading an item in the `workorders` dataset. |
| done:wfm:sync:workorders:start        |   The sync process started for the `workorders` dataset. |
| error:wfm:sync:workorders:start        |   An error occurred when starting the `workorders` dataset. |
| done:wfm:sync:workorders:stop        |   The sync process stopped for the `workorders` dataset. |
| error:wfm:sync:workorders:stop        |   An error occurred when stopping the `workorders` dataset sync process. |
| done:wfm:sync:workorders:force_sync        |  A force sync process completed for the `workorders` dataset. |
| error:wfm:sync:workorders:force_sync        |   An error occurred when forcing the sync process for the `workorders` dataset. |

## Usage in an express backend

### Setup
The server-side component of this RainCatcher module exports a function that takes express and mediator instances as parameters, as in:

```javascript
var express = require('express')
  , app = express()
  , mbaasExpress = mbaasApi.mbaasExpress()
  , mediator = require('fh-wfm-mediator/lib/mediator')
  ;

// configure the express app
...

// setup the wfm workorder sync server
require('fh-wfm-workorder/server')(mediator, app, mbaasExpress);

```

### Server side events
the module broadcasts, and listens for the following events

| Listens for | Responds with |
| ----------- | ------------- |
| `wfm:workorder:list` | `done:wfm:workorder:list` |
| `wfm:workorder:read` | `done:wfm:workorder:read` |
| `wfm:workorder:update` | `done:wfm:workorder:update` |
| `wfm:workorder:create` | `done:wfm:workorder:create` |

### Integration

Check this [demo cloud application](https://github.com/feedhenry-raincatcher/raincatcher-demo-cloud/blob/master/lib/app/workorder.js)

### Workorder data structure example

```javascript

  {
     id: 1276001,
     workflowId: '1339',
     assignee: '156340',
     type: 'Job Order',
     title: 'Footpath in disrepair',
     status: 'New',
     startTimestamp: '2015-10-22T14:00:00Z',
     address: '1795 Davie St, Vancouver, BC V6G 2M9',
     location: [49.287227, -123.141489],
     summary: 'Please remove damaged kerb and SUPPLY AND FIX 1X DROP KERB CENTRE BN 125 X 150 cart away from site outside number 3.'
  }

```
