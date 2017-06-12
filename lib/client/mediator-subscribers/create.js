var _ = require('lodash');
var workorderClient = require('../workorder-client');
var Q = require('q');


/**
 * Initialising a subscriber for creating a workorder.

 *
 */
module.exports = function createWorkorderSubscriber() {

  /**
   *
   * Handling the creation of a workorder
   *
   * @param {object} parameters
   * @param {object} parameters.workorderToCreate   - The workorder item to create
   * @returns {*}
   */
  return function handleCreateWorkorderTopic(parameters) {
    var self = this;
    parameters = parameters || {};

    var workorderToCreate = parameters.workorderToCreate;

    //If no workorder is passed, can't create one
    if (!_.isPlainObject(workorderToCreate)) {
      return Q.reject(new Error("Invalid Data To Create A Workorder."));
    }

    return workorderClient(self.mediator).manager.create(workorderToCreate);
  };
};