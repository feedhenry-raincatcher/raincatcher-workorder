'use strict';

var ngModule = angular.module('wfm.workorder.directives', ['wfm.core.mediator']);
module.exports = 'wfm.workorder.directives';

require('../../dist');

var getStatusIconColor = function(status) {
  var statusIcon;
  var statusColor;
  switch (status) {
  case 'In Progress':
    statusIcon = 'autorenew';
    statusColor = 'warning';
    break;
  case 'Complete':
    statusIcon = 'assignment_turned_in';
    statusColor = 'success';
    break;
  case 'Aborted':
    statusIcon = 'assignment_late';
    statusColor = 'danger';
    break;
  case 'On Hold':
    statusIcon = 'pause';
    statusColor = 'warning';
    break;
  case 'Unassigned':
    statusIcon = 'assignment_ind';
    statusColor = 'warning';
    break;
  case 'New':
    statusIcon = 'new_releases';
    statusColor = '';
    break;
  default:
    statusIcon = 'radio_button_unchecked';
    statusColor = '';
  }
  return {
    statusIcon: statusIcon,
    statusColor: statusColor
  };
};

ngModule.directive('workorderList', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder-list.tpl.html')
  , scope: {
    workorders : '=',
    resultMap: '=',
    selectedModel: '='
  }
  , controller: function($scope) {
    var self = this;
    self.workorders = $scope.workorders;
    $scope.$watch('workorders', function() {
      self.workorders = $scope.workorders;
    });
    self.resultMap = $scope.resultMap;
    self.selected = $scope.selectedModel;
    self.selectWorkorder = function(event, workorder) {
        // self.selectedWorkorderId = workorder.id;
      mediator.publish('wfm:workorder:selected', workorder);
      event.preventDefault();
      event.stopPropagation();
    };
    self.isWorkorderShown = function(workorder) {
      return self.shownWorkorder === workorder;
    };

    self.applyFilter = function(term) {
      term = term.toLowerCase();
      self.workorders = $scope.workorders.filter(function(workorder) {
        return String(workorder.id).indexOf(term) !== -1
            || String(workorder.title).toLowerCase().indexOf(term) !== -1;
      });
    };
    self.getColorIcon = function(workorder) {
      var result = this.resultMap[workorder.id];
      if (result === undefined) {
        return getStatusIconColor('').statusColor;
      } else {
        return getStatusIconColor(this.resultMap[workorder.id].status).statusColor;
      }
    };
  }
  , controllerAs: 'ctrl'
  };
})

.directive('workorder', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/workorder.tpl.html')
  , scope: {
    workorder: '=',
    assignee: '=',
    status: '='
  }
  , controller: function($scope) {
    var self = this;
    self.showSelectButton = !! $scope.$parent.workorders;
    self.selectWorkorder = function(event, workorder) {
      if (workorder.id) {
        mediator.publish('wfm:workorder:selected', workorder);
      } else {
        mediator.publish('wfm:workorder:list');
      }

      event.preventDefault();
      event.stopPropagation();
    };
    self.getColorIcon = function(status) {
      return getStatusIconColor(status).statusColor;
    };
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
  , workers: '='
  , status: '='
  }
  , controller: function($scope) {
    var self = this;
    var today = new Date();
    today.setHours(today.getHours()-24);
    $scope.today = today.toISOString();
    var maxDate = new Date();
    maxDate.setFullYear(today.getFullYear()+100);
    $scope.maxDate = maxDate.toISOString();
    self.model = angular.copy($scope.workorder);
    self.workflows = $scope.workflows;
    self.workers = $scope.workers;
    self.submitted = false;

    if (self.model && self.model.startTimestamp) {
      self.model.finishDate = new Date(self.model.startTimestamp);
      self.model.finishTime = new Date(self.model.startTimestamp);
    }
    self.selectWorkorder = function(event, workorder) {
      if (workorder.id) {
        mediator.publish('wfm:workorder:selected', workorder);
      } else {
        mediator.publish('wfm:workorder:list');
      }
      event.preventDefault();
      event.stopPropagation();
    };
    self.done = function(isValid) {
      self.submitted = true;
      if (isValid) {
        self.model.startTimestamp = new Date(self.model.finishDate); // TODO: incorporate self.model.finishTime
        self.model.startTimestamp.setHours(
            self.model.finishTime.getHours(),
            self.model.finishTime.getMinutes(),
            self.model.finishTime.getSeconds(),
            self.model.finishTime.getMilliseconds()
          );
        self.model.finishDate = new Date(self.model.startTimestamp);
        self.model.finishTime = new Date(self.model.startTimestamp);
        if (!self.model.id && self.model.id !== 0) {
          mediator.publish('wfm:workorder:created', self.model);
        } else {
          mediator.publish('wfm:workorder:updated', self.model);
        }
      }
    };
  }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderStatus', function() {
  return {
    restrict: 'E'
  , template: '<md-icon md-font-set="material-icons">{{statusIcon}}<md-tooltip>{{status}}</md-tooltip></md-icon>'
  , scope: {
    status : '=status'
  }
  , controller: function($scope) {
    $scope.statusIcon = getStatusIconColor($scope.status).statusIcon;
  }
  , controllerAs: 'ctrl'
  };
})

.directive('workorderSubmissionResult', function($compile) {
  var render = function(scope, element) {
    if (!scope.result) {
      return;
    }
    var result = scope.result;
    var template = '';
    if (scope.step.formId) {
      var submission = result.submission;
      if (submission._submission) {
        template = '<appform-submission submission="result.submission._submission"></appform-submission>';
      } else if (submission.submissionId) {
        template = '<appform-submission submission-id="\''+submission.submissionId+'\'"></appform-submission>';
      } else if (submission.submissionLocalId) {
        template = '<appform-submission submission-local-id="\''+submission.submissionLocalId+'\'"></appform-submission>';
      }
    } else {
      template = scope.step.templates.view;
    }
    element.append(template);
    $compile(element.contents())(scope);
  };

  return {
    restrict: 'E'
  , scope: {
    result: '='
    , step: '='
  }
  , link: function(scope, element, attrs) {
    render(scope, element, attrs);
  }
  };
})
;
