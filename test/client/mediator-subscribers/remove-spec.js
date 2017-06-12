var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var expect = chai.expect;
var Q = require('q');

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Workorder Remove Mediator Topic", function() {

  var mockWorkorder = {
    id: "workorderid",
    name: "This is a mock Work Order"
  };

  var removeTopic = "wfm:workorders:remove";

  var syncRemoveTopic = "wfm:sync:workorders:remove";

  var workorderSubscribers = new MediatorTopicUtility(mediator);
  workorderSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    workorderSubscribers.on(CONSTANTS.TOPICS.REMOVE, require('./../../../lib/client/mediator-subscribers/remove')(workorderSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    workorderSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to remove a workorder', function() {
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');

      return Q.resolve(mockWorkorder);
    });

    return mediator.publish(removeTopic, {id: mockWorkorder.id});
  });

  it('should publish an error if there is no ID to remove', function() {

    return  mediator.publish(removeTopic).catch(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');

      return Q.reject(expectedError);
    });

    return  mediator.publish(removeTopic, {id: mockWorkorder.id}).catch(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});