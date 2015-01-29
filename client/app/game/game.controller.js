'use strict';

angular.module('pahApp')
  .controller('GameCtrl', function ($scope, $stateParams) {



    // if not gameState
    //$stateParams.gameId;
    // FActory.getGameState(gameId);

    $scope.gameState = {
      _id: Game._id,
      host: User._id
      users: [{
        _id: Hash
        name: String
        points: Number,
        isDealer: Boolean,
        hand: [Numbers]
      }],
      discardedWhite: [Numbers],
      discardedBlack: [Numbers]
    };






  });
