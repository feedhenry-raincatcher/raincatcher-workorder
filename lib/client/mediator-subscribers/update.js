var _ = require('lodash');
var workorderClient = require('../workorder-client');
var Q = require('q');

/**
 * Initialsing a subscriber for updating a workorder.
 *
 */
module.exports = function updateWorkorderSubscriber() {

  /**
   *
   * Handling the update of a workorder
   *
   * @param {object} parameters
   * @param {object} parameters.workorderToUpdate   - The workorder item to update
   * @returns {*}
   */
  return function handleUpdateTopic(parameters) {
    var self = this;
    parameters = parameters || {};

    var workorderToUpdate = parameters.workorderToUpdate;

    //If no workorder is passed, can't update one. Also require the ID of the workorder to update it.
    if (!_.isPlainObject(workorderToUpdate)) {
      return Q.reject(new Error("Invalid Data To Update A Workorder."));
    }

    return workorderClient(self.mediator).manager.update(workorderToUpdate);
  };
};