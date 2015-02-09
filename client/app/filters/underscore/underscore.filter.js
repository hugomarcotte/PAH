'use strict';

angular.module('pahApp')
  .filter('underscore', function () {
    return function (input) {
      return input.replace("_", "_______");
    };
  });
