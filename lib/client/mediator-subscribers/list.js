var workorderClient = require('../workorder-client');

/**
 * Initialsing a subscriber for Listing workorders.

 *
 */
module.exports = function listWorkorderSubscriber() {

  /**
   *
   * Handling the listing of workorders
   *
   * @param {object} parameters
   * @returns {*}
   */
  return function handleListWorkordersTopic() {
    var self = this;

    return workorderClient(self.mediator).manager.list();
  };
};