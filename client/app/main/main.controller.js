'use strict';

angular.module('pahApp')
  .controller('MainCtrl', function ($scope, ngDialog) {

    $scope.games = [{},{name:'game1'}]

    $scope.createGame = function () {
      ngDialog.open({ template: 'createGameTmpl' });
    };

    $scope.joinGame = function () {
      ngDialog.open({ template: 'joinGameTmpl' });
    };
  });
