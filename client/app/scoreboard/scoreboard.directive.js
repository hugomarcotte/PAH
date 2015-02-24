'use strict';

angular.module('pahApp')
  .directive('scoreboard', function () {
    return {
      templateUrl: 'app/scoreboard/scoreboard.html',
      restrict: 'E',
      scope: true,
      controller: 'PahCtrl',
      link: function (scope, element, attrs) {
      }
    };
  });
