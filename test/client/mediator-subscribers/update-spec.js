var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');


describe("Workorder Update Mediator Topic", function() {

  var mockWorkorderToUpdate = {
    id: "workorderidtoupdate",
    name: "This is a mock Work Order"
  };

  var expectedUpdatedWorkorder =  _.defaults({name: "Updated Workorder"}, mockWorkorderToUpdate);

  var topicUid = 'testtopicuid1';

  var updateTopic = "wfm:workorders:update";
  var doneUpdateTopic = "done:wfm:workorders:update:testtopicuid1";
  var errorUpdateTopic = "error:wfm:workorders:update:testtopicuid1";

  var syncUpdateTopic = "wfm:sync:workorders:update";
  var doneSyncUpdateTopic = "done:wfm:sync:workorders:update";
  var errorSyncUpdateTopic = "error:wfm:sync:workorders:update";

  var workorderSubscribers = new MediatorTopicUtility(mediator);
  workorderSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    workorderSubscribers.on(CONSTANTS.TOPICS.UPDATE, require('./../../../lib/client/mediator-subscribers/update')(workorderSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    workorderSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to update a workorder', function() {
    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockWorkorderToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncUpdateTopic + ":" + parameters.topicUid, expectedUpdatedWorkorder);
    });

    var donePromise = mediator.promise(doneUpdateTopic);

    mediator.publish(updateTopic, {
      workorderToUpdate: mockWorkorderToUpdate,
      topicUid: topicUid
    });

    return donePromise.then(function(updatedWorkorder) {
      expect(updatedWorkorder).to.deep.equal(expectedUpdatedWorkorder);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should publish an error if there is no workorder id', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      workorderToUpdate: {},
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");

    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockWorkorderToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncUpdateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      workorderToUpdate: mockWorkorderToUpdate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});