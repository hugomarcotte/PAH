'use strict';

angular.module('pahApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('backend_sandbox', {
        url: '/backend_sandbox',
        templateUrl: 'app/backend_sandbox/backend_sandbox.html',
        controller: 'BackendSandboxCtrl'
      });
  });