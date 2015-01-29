'use strict';

angular.module('pahApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pah', {
        url: '/pah',
        templateUrl: 'app/pah/pah.html',
        controller: 'PahCtrl'
      });
  });
