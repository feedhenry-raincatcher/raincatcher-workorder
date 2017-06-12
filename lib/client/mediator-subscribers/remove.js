var workorderClient = require('../workorder-client');
var Q = require('q');

/**
 * Initialsing a subscriber for removing workorders.
 *
 */
module.exports = function removeWorkorderSubscriber() {


  /**
   *
   * Handling the removal of a single workorder
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the workorder to remove.
   * @returns {*}
   */
  return function handleRemoveWorkorder(parameters) {
    var self = this;
    parameters = parameters || {};

    //If there is no ID, then we can't read the workorder.
    if (!parameters.id) {
      return Q.reject(new Error("Expected An ID When Removing A Workorder"));
    }

    return workorderClient(self.mediator).manager.delete({
      id: parameters.id
    });
  };
};