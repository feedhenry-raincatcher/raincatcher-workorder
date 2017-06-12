# FeedHenry RainCatcher workorder [![Build Status](https://travis-ci.org/feedhenry-raincatcher/raincatcher-workorder.png)](https://travis-ci.org/feedhenry-raincatcher/raincatcher-workorder) [![Coverage Status](https://coveralls.io/repos/github/feedhenry-raincatcher/raincatcher-workorder/badge.svg?branch=master)](https://coveralls.io/github/feedhenry-raincatcher/raincatcher-workorder?branch=master)

This module contains a workorder model representation and its related services :
- Backend services
- Frontend services

## Client Usage

### Setup
This module is packaged in a CommonJS format, exporting the name of the Angular namespace.  The module can be included in an angular.js as follows:

```javascript
var mediator = require('fh-wfm-mediator');
var workorderModule = require('fh-wfm-workorder/lib/client');

// Executing the setup function for the workorder module.
workorderModule(mediator);

// Setup is now complete, the module is now subscribing to its topics.

```

### Integration

### Topic Subscriptions

| Topic | Parameters |
| ----------- | ------------- |
| wfm:workorders:list |  ```NONE```  |
| wfm:workorders:read | ```{id: <<id of workorder to read>>}``` |
| wfm:workorders:update | ```{workorderToUpdate: {<<A valid workorder>>}}``` |
| wfm:workorders:create | ```{workorderToCreate: {<<A valid workorder>>}}``` |
| wfm:workorders:remove | ```{id: <<id of workorder to remove>>}``` |

### Published Topics

The following topics are published by this module. Developers are free to implement these topics subscribers, or use a module that already has these subscribers implement (E.g. the [raincatcher-sync](https://github.com/feedhenry-raincatcher/raincatcher-sync) module).


| Topic         | Parameters           |
| ------------- |:-------------:| 
| wfm:sync:workorders:create              |  ```{itemToCreate: workorderToCreate}```  |
| wfm:sync:workorders:update              |  ```{itemToUpdate: workorderToUpdate}```  |
| wfm:sync:workorders:list              |  ```NONE```  |
| wfm:sync:workorders:remove              |  ```{id: <<ID Of Workorder To Remove>>}```  |
| wfm:sync:workorders:read              |  ```{id: <<ID Of Workorder To Read>>}```  |


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
require('fh-wfm-workorder/lib/cloud')(mediator);

```

### Server side topics

#### Subscribed Topics

The module subscribes to the following topics

| Topic | Parameters |
| ----------- | ------------- |
| wfm:cloud:workorders:list |  ```{filter: {<<filter parameters>>}}```  |
| wfm:cloud:workorders:read | ```<<id of workorder to read>>``` |
| wfm:cloud:workorders:update | ```{<<<workorder to update>>>}``` |
| wfm:cloud:workorders:create | ```{<<<workorder to create>>>}``` |
| wfm:cloud:workorders:delete | ```<<id of workorder to delete>>``` |


#### Published Topics
The module publishes the following topics

| Topic | Parameters |
| ----------- | ------------- |
| wfm:cloud:data:workorders:list |  ```{<<filter parameters>>}```  |
| wfm:cloud:data:workorders:read | ```<<id of workorder to read>>``` |
| wfm:cloud:data:workorders:update | ```{<<<workorder to update>>>}``` |
| wfm:cloud:data:workorders:create | ```{<<<workorder to update>>>}``` |
| wfm:cloud:data:workorders:delete | ```<<id of workorder to delete>>``` |

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
