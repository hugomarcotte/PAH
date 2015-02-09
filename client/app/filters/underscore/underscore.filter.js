'use strict';

angular.module('pahApp')
  .filter('underscore', function () {
    return function (input) {
  	if(!input) return "";
      return input.replace(/_/g, "_______");
    };
  });
