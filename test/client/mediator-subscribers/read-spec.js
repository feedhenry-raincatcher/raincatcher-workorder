var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Workorder Read Mediator Topic", function() {

  var mockWorkorder = {
    id: "workorderid",
    name: "This is a mock Work Order"
  };

  var readTopic = "wfm:workorders:read";
  var doneReadTopic = "done:wfm:workorders:read:workorderid";
  var errorReadTopic = "error:wfm:workorders:read";

  var syncReadTopic = "wfm:sync:workorders:read";
  var doneSyncReadTopic = "done:wfm:sync:workorders:read:workorderid";
  var errorSyncReadTopic = "error:wfm:sync:workorders:read:workorderid";

  var workorderSubscribers = new MediatorTopicUtility(mediator);
  workorderSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  var readSubscribers = require('./../../../lib/client/mediator-subscribers/read')(workorderSubscribers);

  beforeEach(function() {
    this.subscribers = {};
    workorderSubscribers.on(CONSTANTS.TOPICS.READ, readSubscribers);
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    workorderSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to read workorder', function() {
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockWorkorder.id);

      mediator.publish(doneSyncReadTopic, mockWorkorder);
    });

    var donePromise = mediator.promise(doneReadTopic);

    mediator.publish(readTopic, {id: mockWorkorder.id, topicUid: mockWorkorder.id});

    return donePromise.then(function(readWorkorder) {
      expect(readWorkorder).to.deep.equal(mockWorkorder);
    });
  });

  it('should publish an error if there is no ID to read', function() {
    var errorPromise = mediator.promise(errorReadTopic);

    mediator.publish(readTopic);

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockWorkorder.id);

      mediator.publish(errorSyncReadTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorReadTopic + ":" + mockWorkorder.id);

    mediator.publish(readTopic, {id: mockWorkorder.id, topicUid: mockWorkorder.id});

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});