var workorderClient = require('../workorder-client');
var Q = require('q');

/**
 * Initialsing a subscriber for reading workorders.
 *
 */
module.exports = function readWorkorderSubscriber() {


  /**
   *
   * Handling the reading of a single workorder
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the workorder to read.
   * @returns {*}
   */
  return function handleReadWorkordersTopic(parameters) {
    var self = this;
    parameters = parameters || {};

    //If there is no ID, then we can't read the workorder.
    if (!parameters.id) {
      return Q.reject(new Error("Expected An ID When Reading A Workorder"));
    }

    return workorderClient(self.mediator).manager.read(parameters.id);
  };

};