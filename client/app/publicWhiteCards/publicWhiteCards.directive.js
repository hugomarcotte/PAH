'use strict';

angular.module('pahApp')
  .directive('publicWhiteCards', function () {
    return {
      templateUrl: 'app/publicWhiteCards/publicWhiteCards.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });