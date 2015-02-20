'use strict';

angular.module('pahApp')
  .directive('privateWhiteCards', function () {
    return {
      templateUrl: 'app/privateWhiteCards/privateWhiteCards.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });