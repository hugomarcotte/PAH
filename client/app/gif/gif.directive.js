'use strict';

angular.module('pahApp')
  .directive('gif', function () {
    return {
      templateUrl: 'app/gif/gif.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });