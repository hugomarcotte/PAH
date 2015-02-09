'use strict';

angular.module('pahApp')
  .factory('gifly', function ($http) {
 
    return {
      buildGifs: function () {
        return $http.get('api/gifs');
      }
    };
  });
