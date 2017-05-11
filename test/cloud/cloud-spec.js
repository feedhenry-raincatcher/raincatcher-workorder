var express = require('express');
var chai = require('chai');
var expect = chai.expect;
var app = express();
var mockMbaasApi = {};
var mediator = require('fh-wfm-mediator/lib/mediator.js');

var CLOUD_TOPICS = {
  create: "wfm:cloud:workorders:create",
  list: "wfm:cloud:workorders:list",
  update: "wfm:cloud:workorders:update",
  read: "wfm:cloud:workorders:read",
  delete: "wfm:cloud:workorders:delete"
};
var CLOUD_DATA_TOPICS = {
  create: "wfm:cloud:data:workorders:create",
  list: "wfm:cloud:data:workorders:list",
  update: "wfm:cloud:data:workorders:update",
  read: "wfm:cloud:data:workorders:read",
  delete: "wfm:cloud:data:workorders:delete"
};
var DONE = 'done:';

/**
 * Set of unit tests for the sync topic subscribers
 */
describe('Workorder Sync', function() {
  var workorderServer = require('./../../lib/cloud/index.js');

  //Create
  it('should publish to done create cloud topic when the request to create a workorder has been completed', function() {
    var mockWorkorderCreate = {value: 'test-workorder-create'};
    var expectedWorkorderVal = 'test-workorder-create';
    var topicId = "testId";

    workorderServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.create, function(createdWorkorder) {
      //Publish to done create data topic to fake workorder creation by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.create + ':' + createdWorkorder.id, createdWorkorder);
    });

    return mediator.request(CLOUD_TOPICS.create, [mockWorkorderCreate, topicId], {uid: topicId}).then(function(createdWorkorder) {
      expect(createdWorkorder, 'Created workorder received should not be null or undefined').to.exist;
      expect(createdWorkorder, 'Created workorder received should be an object').to.be.an('object');
      expect(createdWorkorder.value, 'Created workorder received should have the same value as the original object passed').to.equal(expectedWorkorderVal);
      expect(createdWorkorder.id, 'Created workorder received should have a generated string ID').to.be.a('string');
    });

  });

  //List
  it('should publish to done list cloud topic when the request to list a workorder has been completed', function() {
    var mockWorkorderArray = [{id: 'test-workorder-1', value:'test-workorder'},
      {id: 'test-workorder-2', value:'test-workorder'},
      {id: 'test-workorder-3', value:'test-workorder'}];

    var expectedWorkorderArray = [{id: 'test-workorder-1', value:'test-workorder'},
      {id: 'test-workorder-2', value:'test-workorder'},
      {id: 'test-workorder-3', value:'test-workorder'}];

    workorderServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.list, function() {
      //Publish to done list data topic to fake getting the list of workorders by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.list, mockWorkorderArray);
    });

    mediator.request(CLOUD_TOPICS.list).then(function(listWorkorder) {
      expect(listWorkorder, 'List of workorders received should not be null or undefined').to.exist;
      expect(listWorkorder, 'List of workorders received should be an array').to.be.an('array');
      expect(listWorkorder, 'List of workorders received should have the same value as the list of workorders sent by the mock storage module').to.deep.equal(expectedWorkorderArray);
    });

  });

  // Update
  it('should publish to done update cloud topic when the request to update a workorder has been completed', function() {
    var mockWorkorderupdate = {id:'testID', value: 'workorder-updated'};
    var expectedWorkorderUpdated = {id:'testID', value: 'workorder-updated'};

    workorderServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.update, function(workorderToUpdate) {
      //Publish to done update data topic to fake getting the update of workorders by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.update + ':' + workorderToUpdate.id, workorderToUpdate);
    });

    return mediator.request(CLOUD_TOPICS.update, mockWorkorderupdate, {uid: mockWorkorderupdate.id}).then(function(updatedWorkorder) {
      expect(updatedWorkorder, 'Updated workorder received should not be null or undefined').to.exist;
      expect(updatedWorkorder, 'Updated workorder received should be an object').to.be.an('object');
      expect(updatedWorkorder, 'Updated workorder received should have the same value as the updated workorder sent by the mock storage module').to.deep.equal(expectedWorkorderUpdated);
    });
  });

  //Read
  it('should publish to done read cloud topic when the request to read a workorder has been completed', function() {
    var mockWorkorderRead = {id:'testID', value: 'workorder-read'};
    var expectedWorkorderRead = {id:'testID', value: 'workorder-read'};
    var uid = "testID";

    workorderServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.read, function(uid) {
      //Publish to done read data topic to fake the reading of workorders by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.read + ':' + uid, mockWorkorderRead);
    });

    return mediator.request(CLOUD_TOPICS.read, uid).then(function(readWorkorder) {
      expect(readWorkorder, 'Read workorder received should not be null or undefined').to.exist;
      expect(readWorkorder, 'Read workorder received should be an object').to.be.an('object');
      expect(readWorkorder, 'Read workorder received should have the same value as the read workorder sent by the mock storage module').to.deep.equal(expectedWorkorderRead);
    });
  });

  //Delete
  it('should publish to done delete cloud topic when the request to delete a workorder has been completed', function() {
    var mockWorkorderDelete = {id:'testID', value: 'workorder-deleted'};
    var expectedWorkorderDeleted = {id:'testID', value: 'workorder-deleted'};
    var uid = "testID";

    workorderServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.delete, function(uid) {
      //Publish to done delete data topic to fake the deleteing of workorders by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.delete + ':' + uid, mockWorkorderDelete);
    });

    return mediator.request("wfm:cloud:workorders:delete", uid).then(function(deletedWorkorder) {
      expect(deletedWorkorder, 'Deleted workorder received should not be null or undefined').to.exist;
      expect(deletedWorkorder, 'Deleted workorder received should be an object').to.be.an('object');
      expect(deletedWorkorder, 'Deleted workorder received should have the same value as the read workorder sent by the mock storage module').to.deep.equal(expectedWorkorderDeleted);

    });
  });

});