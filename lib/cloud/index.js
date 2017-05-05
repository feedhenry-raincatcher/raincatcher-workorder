'use strict';

var config = require('../config');
var shortid = require('shortid');

var WorkorderTopics = require('fh-wfm-mediator/lib/topics');

module.exports = function(mediator) {
  //Used for cloud data storage topics
  var workorderCloudDataTopics = new WorkorderTopics(mediator);
  workorderCloudDataTopics.prefix(config.cloudDataTopicPrefix).entity(config.datasetId);

  //Used for cloud topics
  var workorderCloudTopics = new WorkorderTopics(mediator);
  workorderCloudTopics.prefix(config.cloudTopicPrefix).entity(config.datasetId);

  /**
   * Subscribers to sync topics which publishes to a data storage topic, subscribed to by a storage module,
   * for CRUDL operations. Publishes the response received from the storage module back to sync
   */
  workorderCloudTopics.on('create', function(workorderToCreate, mediatorTopicIdentifier) {
    // Adds an id field required by the new simple store module to the workorder object that will be created
    workorderToCreate.id = shortid.generate();

    workorderCloudDataTopics.request('create', workorderToCreate, {uid: workorderToCreate.id})
      .then(function(createdworkorder) {
        mediator.publish(workorderCloudTopics.getTopic('create', 'done') + ':' + mediatorTopicIdentifier, createdworkorder);
      });
  });

  workorderCloudTopics.on('list', function(listOptions) {
    var self = this;
    listOptions = listOptions || {};
    listOptions.filter = listOptions.filter || {};
    listOptions.filter.topicUid = listOptions.topicUid || shortid.generate();

    workorderCloudDataTopics.request('list', listOptions.filter, {uid: listOptions.filter.topicUid}).then(function(list) {
      self.mediator.publish(workorderCloudTopics.getTopic('list', 'done', listOptions.filter.topicUid), list);
    }).catch(function(err) {
      self.mediator.publish(workorderCloudTopics.getTopic('list', 'error', listOptions.filter.topicUid), err);
    });
  });

  workorderCloudTopics.on('update', function(workorderToUpdate) {
    return workorderCloudDataTopics.request('update', workorderToUpdate, {uid: workorderToUpdate.id});
  });

  workorderCloudTopics.on('read', function(uid) {
    return workorderCloudDataTopics.request('read', uid);
  });

  workorderCloudTopics.on('delete', function(uid) {
    return workorderCloudDataTopics.request('delete', uid);
  });
};