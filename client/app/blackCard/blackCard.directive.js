'use strict';

angular.module('pahApp')
  .directive('blackCard', function () {
    return {
      templateUrl: 'app/blackCard/blackCard.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });