var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var expect = chai.expect;
var Q = require('q');

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');


describe("Workorder Update Mediator Topic", function() {

  var mockWorkorderToUpdate = {
    id: "workorderidtoupdate",
    name: "This is a mock Work Order"
  };

  var expectedUpdatedWorkorder =  _.defaults({name: "Updated Workorder"}, mockWorkorderToUpdate);

  var updateTopic = "wfm:workorders:update";

  var syncUpdateTopic = "wfm:sync:workorders:update";

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

      return Q.resolve(expectedUpdatedWorkorder);
    });

    return mediator.publish(updateTopic, {
      workorderToUpdate: mockWorkorderToUpdate
    }).then(function(updatedWorkorder) {
      expect(updatedWorkorder).to.deep.equal(expectedUpdatedWorkorder);
    });
  });

  it('should publish an error if there is no object to update', function() {
    return mediator.publish(updateTopic, {}).catch(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should publish an error if there is no workorder id', function() {
    return  mediator.publish(updateTopic, {
      workorderToUpdate: {}
    }).catch(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");

    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockWorkorderToUpdate);

      return Q.reject(expectedError);
    });


    return mediator.publish(updateTopic, {
      workorderToUpdate: mockWorkorderToUpdate
    }).catch(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});