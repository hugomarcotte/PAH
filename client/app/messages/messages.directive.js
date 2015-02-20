'use strict';

angular.module('pahApp')
  .directive('messages', function () {
    return {
      templateUrl: 'app/messages/messages.html',
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });