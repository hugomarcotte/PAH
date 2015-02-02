'use strict';

angular.module('pahApp')

.directive('resize', function ($window) {
  return function (scope, element) {
    var w = angular.element($window);
    scope.$watch(function () {
      return { 'h': w.height(), 'w': w.width() };
    }, function (newValue, oldValue) {

      if(newValue.h > 700) {
        scope.windowHeight = newValue.h;

        scope.style = function () {
          return {
            'height': (newValue.h) + 'px'
          };
        };
      }


    }, true);

    w.bind('resize', function () {
      scope.$apply();
    });
  }
});
