'use strict';

// var angular = require('angular');
var _ = require('lodash');
var config = require('./config');
require('ng-feedhenry');
require('fh-wfm-sync');
var ngModule = angular.module('wfm.workorder', ['wfm.core.mediator', 'wfm.core.sync', 'ngFeedHenry']);

require('./lib');

var getStatusIcon = function(workorder) {
  if (! workorder) {
    return '';
  }
  var statusIcon;
  switch(workorder.status) {
    case 'In Progress':
      statusIcon = 'ion-load-d';
      break;
    case 'Complete':
      statusIcon = 'ion-ios-checkmark-outline';
      break;
    case 'Aborted':
      statusIcon = 'ion-ios-close-outline';
      break;
    case 'On Hold':
      statusIcon = 'ion-ios-minus-outline';
      break;
    case 'Unassigned':
      statusIcon = 'ion-ios-help-outline';
      break;
    case 'New':
      statusIcon = 'ion-ios-plus-outline';
      break;
    default:
      statusIcon = 'ion-ios-circle-outline';
  }
  return statusIcon;
}

ngModule.factory('workorderManager', function($q, FHCloud, mediator, sync) {
  var workorderManager = {};
  var workorders;

  var removeLocalVars = function(workorder) {
    _.keys(workorder).filter(function(key) {
      return key.indexOf('_') === 0;
    }).forEach(function(localKey) {
      delete workorder[localKey];
    });
    if (workorder.steps) {
      _.values(workorder.steps).forEach(function(step) {
        _.keys(step.submission).filter(function(key) {
          return key.indexOf('_') === 0;
        }).forEach(function(localKey) {
          delete step.submission[localKey];
        });
      });
    };
  };


  //manage the dataSet
   sync.getSync().manage(config.datasetId, {}, {}, {}, function() {
    console.log(config.datasetId + " managed by the sync service ");
    $fh.sync.doList(config.datasetId,
    function(res) {
      var workorders =  sync.transformDataSet(res);
    },
    function(err) {
      console.log('Error result from list:', JSON.stringify(err));
    });
  });

  //subscribe for sync notifications
  mediator.subscribe("wfm:sync:"+config.datasetId, function(notification) {
    var code = notification.code

    if (code == "record_delta_received" && notification.message == "create") {
      asyncGetWorkorder(notification.uid).then( function(result) {mediator.publish('workorder:created', result);});
    }
    if (code == "record_delta_received" && notification.message == "update") {
      asyncGetWorkorder(notification.uid).then( function(result) {mediator.publish('workorder:saved', result);});
    }
  });

  var asyncListWorkorders = function() {
    var d = $q.defer();
    $fh.sync.doList(config.datasetId,
    function(res) {
      var workorders = sync.transformDataSet(res);
      d.resolve(workorders);
    },
    function(err) {
      d.reject(err);
    });
    return d.promise;
  };

  var asyncCreateWorkorder = function(workorder) {
    var d = $q.defer();
    $fh.sync.doCreate(config.datasetId, workorder,
    function(res) {
      d.resolve(res);
    },
    function(err) {
      d.reject(err);
    });
    return d.promise;
  };

  var asyncSaveWorkorder = function(workorder) {
    var d = $q.defer();
    $fh.sync.doUpdate(config.datasetId, workorder.id, workorder,
    function(res) {
      d.resolve(res);
    },
    function(err) {
      d.reject(err);
    });
    return d.promise;
  };

  var asyncGetWorkorder = function(id) {
    var d = $q.defer();
    $fh.sync.doRead(config.datasetId, id,
    function(res) {
      if (res.data.finishTimestamp) {
        res.data.finishTimestamp = new Date(res.data.finishTimestamp);
      }
      d.resolve(res.data);
    },
    function(err) {
      d.reject(err);
    });
    return d.promise;
  };

  var fetch = function() {
    return asyncListWorkorders();
  };


  workorderManager.get = function(id) {
    return asyncGetWorkorder(id);
  };

  workorderManager.getList = function() {
    return fetch();
  };

  workorderManager.get = function(id) {
    return asyncGetWorkorder(id);
  };

  workorderManager.save = function(workorder) {
    return asyncSaveWorkorder(workorder);
  };

  workorderManager.create = function(workorder) {
    return asyncCreateWorkorder(workorder);
  };

  return workorderManager;
})
.run(function($timeout, mediator, workorderManager) {
  mediator.subscribe('workorder:load', function(data) {
    workorderManager.get(data).then(function(workorder) {
      mediator.publish('workorder:loaded', workorder);
    })
  });
  mediator.subscribe('workorders:load', function() {
    workorderManager.getList().then(function(workorders) {
      mediator.publish('workorders:loaded', workorders);
    })
  });
  mediator.subscribe('workorder:save', function(data) {
    workorderManager.save(data).then(function(workorder) {
      mediator.publish('workorder:saved', workorder);
    })
  });
  mediator.subscribe('workorder:create', function(data) {
    workorderManager.create(data).then(function(workorder) {
      mediator.publish('workorder:created', workorder);
    })
  });
  mediator.subscribe('workorder:new', function(data) {
    $timeout(function() {
      var workorder = {
        type: 'Job Order'
      , status: 'New'
      };
      mediator.publish('workorder:new:done', workorder);
    })
  });
})

.directive('workorderPortalView', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-portal-view.tpl.html')
  , scope: {
      workorder: '=workorder'
    , workflow: '=workflow'
    }
  , controller: function(mediator) {
      this.selectWorkflow = function(workflow) {
        mediator.publish('workflow:selected', workflow);
      };
    }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderPortalList', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-portal-list.tpl.html')
  , scope: {
      list : '=list'
    }
  , controller: function() {
      var self = this;
      self.selectWorkorder = function(event, workorder) {
        self.selectedWorkorderId = workorder.id;
        mediator.publish('workorder:selected', workorder);
        event.preventDefault();
      }
    }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderList', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-list.tpl.html')
  , scope: {
      workorders : '='
    }
  , controller: function() {
      var self = this;
      self.getStatusIcon = getStatusIcon;
      self.isWorkorderShown = function(workorder) {
        return self.shownWorkorder === workorder;
      };
      self.toggleWorkorder = function(event, workorder) {
        if (self.isWorkorderShown(workorder)) {
          self.shownWorkorder = '';
        } else {
          self.shownWorkorder = workorder;
        }
      }
    }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderListItem', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-list-item.tpl.html')
  , scope: {
    workorder : '=workorder'
    }
  , controller: function($scope) {
      var self = this;
      self.showSelectButton = !! $scope.$parent.workorders;
      self.selectWorkorder = function(event, workorder) {
        mediator.publish('workorder:selected', workorder);
        event.preventDefault();
      }
    }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderForm', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-form.tpl.html')
  , scope: {
    workorder : '=value'
  , workflows: '='
    }
  , controller: function($scope) {
      var self = this;
      self.model = angular.copy($scope.workorder);
      self.workflows = $scope.workflows;
      self.submitted = false;
      if (self.model.finishTimestamp) {
        self.model.finishDate = new Date(self.model.finishTimestamp);
        self.model.finishTime = new Date(self.model.finishTimestamp);
      };
      self.done = function(isValid) {
        self.submitted = true;
        if (isValid) {
          self.model.finishTimestamp = new Date(self.model.finishDate); // TODO: incorporate self.model.finishTime
          delete self.model.finishDate;
          delete self.model.finishTime;
          mediator.publish('workorder:edited', self.model);
        }
      }
    }
  , controllerAs: 'ctrl'
  };
})


;

module.exports = 'wfm.workorder';
