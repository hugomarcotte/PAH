'use strict';

angular.module('pahApp')
  .directive('topButtons', function () {
    return {
      templateUrl: 'app/topButtons/topButtons.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });