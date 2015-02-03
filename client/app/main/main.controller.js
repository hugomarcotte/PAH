'use strict';

angular.module('pahApp')
  .controller('MainCtrl', function($scope, CAHFactory, ngDialog, $http, $location, socket, deck, $cookies) {


    $scope.openJoinDialog = function() {
      ngDialog.open({
        template: 'joinGameDialog',
        controller: 'MainCtrl'
      });
    };


    // $scope.createNewGame = function() {
    //   CAHFactory.init();
    //   $location.path('/pah/1234');
    //   ngDialog.close();
    // };

    // $scope.joinGame = function() {
    //   if ($scope.gameCode && $scope.playerName) {
    //     CAHFactory.join($scope.playerName, $scope.gameCode);
    //     $location.path('/pah/1234');
    //     ngDialog.close();
    //   }
    // };
    $scope.createNewGame = function() {
      return $scope.createOrJoin();
      CAHFactory.init();
      $location.path('/pah/1234');
      ngDialog.close();
    };

    //         $scope.joinGame = function() {
    //         	return $scope.createOrJoin();
    //                 if ($scope.gameCode && $scope.playerName) {
    //                 CAHFactory.join($scope.playerName, $scope.gameCode);
    //                  $location.path('/pah/1234');
    //                 ngDialog.close();
    //           }
    //         };

    //         /////


    $scope.startNow = function() {
      ngDialog.open({
        template: 'startGameDialog',
        controller: 'MainCtrl'
      });
    };



    $scope.joinGame = function() {
      if ($scope.gameCode && $scope.playerName) {

        CAHFactory.join($scope.playerName, $scope.gameCode, function(game) {
          //ngDialog.close();
          if ($cookies.games) {

            /// parse it push it stringify it reset it
            var cookies = JSON.parse($cookies.games);
            cookies.push({
              gameId: game.state.code,
              userId: game.playerId
            });
            $cookies.games = JSON.stringify(cookies);
          } else {
            console.log("Doing this!!!!!!!!")
              /// [{gameid: fdsaf, playerId: fdsafds}] /// stringify and set
            $cookies.games = JSON.stringify([{
              gameId: game.state._id,
              userId: game.playerId
            }]);
          }

          $location.path('/pah/' + game.state.code);

        });



        // $cookies.games = JSON.stringify([{gameId: $scope.gameCode, userId: $scope.playerName}]);
        // console.log(JSON.parse($cookies.games));
        // CAHFactory.join($scope.playerName, $scope.gameCode);
        // $location.path('/pah/1234');
        ngDialog.close();
      }


    };


    $scope.createOrJoin = function() {



      // Join as player
      if ($scope.gameCode && $scope.playerName) {
        CAHFactory.join($scope.playerName, $scope.gameCode, function(game) {
          ngDialog.close();
          if ($cookies.games) {
            /// parse it push it stringify it reset it
            var cookies = JSON.parse($cookies.games);
            cookies.push({
              gameId: game.state.code,
              userId: game.playerId
            });
            $cookies.games = JSON.stringify(cookies);
          } else {

            /// [{gameid: fdsaf, playerId: fdsafds}] /// stringify and se
            $cookies.games = JSON.stringify([{
              gameId: game.state._id,
              userId: game.playerId
            }]);
          }

          $location.path('/backend_sandbox/' + game.state.code);

        });
      }



      // Join as spectator
      else if ($scope.gameCode) {
        CAHFactory.spectate($scope.gameCode);
      }
      // Create and join as player
      else if ($scope.playerName) {
        CAHFactory.init($scope.playerName, function(game) {
          // ngDialog.close();
          $location.path('/pah/' + game.code);
        });
        //CAHFactory.join();
      }
      // Create and join as spectator
      else {
        CAHFactory.init(null, function(game) {
          // ngDialog.close();
          console.log(game);
          $location.path('/pah/' + game.code);
        });
        //CAHFactory.spectate();
      }
      ngDialog.close();
    };

    // console.log(CAHFactory.init());
    // console.log(CAHFactory.draw());
    // console.log(CAHFactory.play(24));
    // console.log(CAHFactory.judge(24));
    // console.log(CAHFactory.join('John', '4815162342'))
    // console.log(CAHFactory.getCurrentHand());
    // console.log(CAHFactory.getCardsInPlay());
    // console.log(CAHFactory.getScoreboard());
  });