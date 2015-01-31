'use strict';

angular.module('pahApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pah', {
        url: '/pah/:code',
        templateUrl: 'app/pah/pah.html',
        controller: 'PahCtrl'
      });
  });
