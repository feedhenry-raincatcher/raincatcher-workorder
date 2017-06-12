var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var Q = require('q');

var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Workorder Create Mediator Topic", function() {

  var mockWorkorderToCreate = {
    name: "This is a mock Work Order"
  };

  var expectedCreatedWorkorder =  _.extend({_localuid: "createdWorkorderLocalId"}, mockWorkorderToCreate);

  var createTopic = "wfm:workorders:create";

  var syncCreateTopic = "wfm:sync:workorders:create";

  var workorderSubscribers = new MediatorTopicUtility(mediator);
  workorderSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    workorderSubscribers.on(CONSTANTS.TOPICS.CREATE, require('./../../../lib/client/mediator-subscribers/create')(workorderSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    workorderSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to create a workorder', function() {
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockWorkorderToCreate);

      return Q.resolve(expectedCreatedWorkorder);
    });

    return mediator.publish(createTopic, {
      workorderToCreate: mockWorkorderToCreate
    }).then(function(createdWorkorder) {
      expect(createdWorkorder).to.deep.equal(expectedCreatedWorkorder);
    });
  });

  it('should publish an error if there is no object to update', function() {
    return mediator.publish(createTopic, {
    }).catch(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockWorkorderToCreate);

      return Q.reject(expectedError);
    });


    return mediator.publish(createTopic, {
      workorderToCreate: mockWorkorderToCreate
    }).catch(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});