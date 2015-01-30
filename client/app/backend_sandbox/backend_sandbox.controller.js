'use strict';

angular.module('pahApp')
    .controller('BackendSandboxCtrl', function($scope, CAHFactory, ngDialog, $http, $location, socket, deck) {
        $scope.state = {};

        $scope.state = CAHFactory.getState();
        console.log($scope.state._id);
        socket.socket.on('pah:' + $scope.state._id, function(item) {
            $scope.state = item;
        });


        $scope.join = function() {
            console.log('join');
            CAHFactory.join($scope.name, $scope.joinCode);
        }

        $scope.startNow = function() {
            ngDialog.open({
                template: 'startGameDialog',
                controller: 'MainCtrl'
            });
        };

        $scope.createOrJoin = function() {

            // Join as player
            if ($scope.gameCode && $scope.playerName) {
                CAHFactory.join($scope.playerName, $scope.gameCode);
            }
            // Join as spectator
            else if ($scope.gameCode) {
                CAHFactory.spectate($scope.gameCode);
            }
            // Create and join as player
            else if ($scope.playerName) {
                CAHFactory.init($scope.playerName);
                //CAHFactory.join();
            }
            // Create and join as spectator
            else {
                CAHFactory.init();
                //CAHFactory.spectate();
            }

            // $location.path('/pah');
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
