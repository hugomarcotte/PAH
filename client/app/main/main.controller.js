'use strict';

angular.module('pahApp')
    .controller('MainCtrl', function($scope, CAHFactory, ngDialog, $http, $location, socket, deck, $cookies) {



        $scope.test = 'test1';


        $scope.startNow = function() {
            ngDialog.open({
                template: 'startGameDialog',
                controller: 'MainCtrl'
            });
        };

        $scope.createOrJoin = function() {

            // Join as player
            if ($scope.gameCode && $scope.playerName) {
                CAHFactory.join($scope.playerName, $scope.gameCode, function(game){
                    ngDialog.close();
                    if ($cookies.games) {
                        /// parse it push it stringify it reset it
                        $cookies.games = JSON.stringify(JSON.parse($cookies.games).push({gameId: game.state.code, userId: game.playerId}));
                    } else {
                        /// [{gameid: fdsaf, playerId: fdsafds}] /// stringify and set
                        $cookies.games = JSON.stringify([{gameId: game.state._id, userId: game.playerId}]);
                    }
                    
                    $location.path('/backend_sandbox/'+game.state.code);

                });
            }
            // Join as spectator
            else if ($scope.gameCode) {
                CAHFactory.spectate($scope.gameCode);
            }
            // Create and join as player
            else if ($scope.playerName) {
                CAHFactory.init($scope.playerName,function(game){
                    ngDialog.close();
                    $location.path('/backend_sandbox/'+game.code);
                });
                //CAHFactory.join();
            }
            // Create and join as spectator
            else {
                CAHFactory.init(null,function(game){
                    ngDialog.close();
                    $location.path('/backend_sandbox/'+game.code);
                });
                //CAHFactory.spectate();
            }

            // $location.path('/pah');
            
            
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
