'use strict';

angular.module('pahApp')
  .directive('toolbarTools', function () {
    return {
      templateUrl: 'app/toolbarTools/toolbarTools.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });