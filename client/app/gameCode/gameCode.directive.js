'use strict';

angular.module('pahApp')
  .directive('gameCode', function () {
    return {
      templateUrl: 'app/gameCode/gameCode.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });