'use strict';

angular.module('pahApp')
  .controller('MainCtrl', function ($scope, ngDialog) {

    $scope.test = 'test1';


    $scope.startNow = function () {
      ngDialog.open({ template: 'startGameDialog', controller: 'MainCtrl' });
    };

  });
