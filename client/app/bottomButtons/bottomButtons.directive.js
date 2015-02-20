'use strict';

angular.module('pahApp')
  .directive('bottomButtons', function () {
    return {
      templateUrl: 'app/bottomButtons/bottomButtons.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });