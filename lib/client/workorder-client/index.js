var q = require('q');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var mediator, manager, workorderSyncSubscribers;


/**
 *
 * Creating a new workorder.
 *
 * @param {object} workorderToCreate - The Workorder to create.
 */
function create(workorderToCreate) {

  var topicParams = {itemToCreate: workorderToCreate};

  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE), topicParams);
}

/**
 *
 * Updating an existing workorder.
 *
 * @param {object} workorderToUpdate - The workorder to update
 * @param {string} workorderToUpdate.id - The ID of the workorder to update
 */
function update(workorderToUpdate) {
  var topicParams = {itemToUpdate: workorderToUpdate};

  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE), topicParams);
}

/***
 *
 * Reading a single workorder.
 *
 * @param {string} workorderId - The ID of the workorder to read
 */
function read(workorderId) {
  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ), {id: workorderId});
}

/**
 * Listing All Workorders
 */
function list() {
  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST));
}

/**
 *
 * Removing a workororder using the sync topics
 *
 * @param {object} workorderToRemove
 * @param {string} workorderToRemove.id - The ID of the workoroder to remove
 */
function remove(workorderToRemove) {

  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE),  {id: workorderToRemove.id});
}

/**
 * Starting the synchronisation process for workorders.
 */
function start() {
  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.START));
}

/**
 * Stopping the synchronisation process for workorders.
 */
function stop() {
  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP));
}

/**
 * Forcing the workorders to sync to the remote store.
 */
function forceSync() {
  return mediator.publish(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC));
}

/**
 * Safe stop forces a synchronisation to the remote server and then stops the synchronisation process.
 * @returns {Promise}
 */
function safeStop() {
  return forceSync().then(stop);
}


/**
 * Waiting for the synchronisation process to complete to the remote cluster.
 */
function waitForSync() {
  return mediator.promise(workorderSyncSubscribers.getTopic(CONSTANTS.TOPICS.SYNC_COMPLETE));
}

function ManagerWrapper(_manager) {
  this.manager = _manager;
  var self = this;

  var methodNames = ['create', 'read', 'update', 'delete', 'list', 'start', 'stop', 'safeStop', 'forceSync', 'waitForSync'];
  methodNames.forEach(function(methodName) {
    self[methodName] = function() {
      return q.when(self.manager[methodName].apply(self.manager, arguments));
    };
  });
}


/**
 *
 * Initialising the workorder-client with a mediator.
 *
 * @param _mediator
 * @returns {ManagerWrapper|*}
 */
module.exports = function(_mediator) {

  //If there is already a manager, use this
  if (manager) {
    return manager;
  }

  mediator = _mediator;

  workorderSyncSubscribers = new MediatorTopicUtility(mediator);
  workorderSyncSubscribers.prefix(CONSTANTS.SYNC_TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  manager = new ManagerWrapper({
    create: create,
    update: update,
    list: list,
    delete: remove,
    start: start,
    stop: stop,
    read: read,
    safeStop: safeStop,
    forceSync: forceSync,
    publishRecordDeltaReceived: _.noop,
    waitForSync: waitForSync,
    datasetId: CONSTANTS.WORKORDER_ENTITY_NAME
  });

  return manager;
};