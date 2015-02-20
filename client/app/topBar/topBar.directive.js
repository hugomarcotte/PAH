'use strict';

angular.module('pahApp')
  .directive('topBar', function () {
    return {
      templateUrl: 'app/topBar/topBar.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });