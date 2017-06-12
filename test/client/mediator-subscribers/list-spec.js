var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../../lib/constants');
var expect = chai.expect;
var Q = require('q');

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Workorder List Mediator Topic", function() {

  var mockWorkorder = {
    id: "workorderid",
    name: "This is a mock Work Order"
  };

  var workorders = [_.clone(mockWorkorder), _.clone(mockWorkorder)];

  var listTopic = "wfm:workorders:list";

  var syncListTopic = "wfm:sync:workorders:list";

  var workorderSubscribers = new MediatorTopicUtility(mediator);
  workorderSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.WORKORDER_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    workorderSubscribers.on(CONSTANTS.TOPICS.LIST, require('./../../../lib/client/mediator-subscribers/list')(workorderSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    workorderSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to list workorders', function() {
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      return Q.resolve(workorders);
    });

    return mediator.publish(listTopic).then(function(arrayOfWorkorders) {
      expect(arrayOfWorkorders).to.deep.equal(workorders);
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      return Q.reject(expectedError);
    });


    return mediator.publish(listTopic).catch(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});