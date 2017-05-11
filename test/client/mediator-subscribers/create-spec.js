var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');

var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Workorder Create Mediator Topic", function() {

  var mockWorkorderToCreate = {
    name: "This is a mock Work Order"
  };

  var expectedCreatedWorkorder =  _.extend({_localuid: "createdWorkorderLocalId"}, mockWorkorderToCreate);

  var topicUid = 'testtopicuid1';

  var createTopic = "wfm:workorders:create";
  var doneCreateTopic = "done:wfm:workorders:create:testtopicuid1";
  var errorCreateTopic = "error:wfm:workorders:create:testtopicuid1";

  var syncCreateTopic = "wfm:sync:workorders:create";
  var doneSyncCreateTopic = "done:wfm:sync:workorders:create";
  var errorSyncCreateTopic = "error:wfm:sync:workorders:create";

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
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncCreateTopic + ":" + parameters.topicUid, expectedCreatedWorkorder);
    });

    var donePromise = mediator.promise(doneCreateTopic);

    mediator.publish(createTopic, {
      workorderToCreate: mockWorkorderToCreate,
      topicUid: topicUid
    });

    return donePromise.then(function(createdWorkorder) {
      expect(createdWorkorder).to.deep.equal(expectedCreatedWorkorder);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockWorkorderToCreate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncCreateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      workorderToCreate: mockWorkorderToCreate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});