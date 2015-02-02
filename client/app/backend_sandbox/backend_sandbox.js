'use strict';

angular.module('pahApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('join', {
        url: '/backend_sandbox',
        templateUrl: 'app/backend_sandbox/backend_sandbox.html',
        controller: 'BackendSandboxCtrl'
      })
       .state('publicBoard', {
        url: '/backend_sandbox/{gameid}',
        templateUrl: 'app/backend_sandbox/backend_sandbox.html',
        controller: 'BackendSandboxCtrl'
      })
       .state('privateBoard', {
        url: '/backend_sandbox/{gameid}/{userid}',
        templateUrl: 'app/backend_sandbox/backend_sandbox.html',
        controller: 'BackendSandboxCtrl'
      });
  });