'use strict';

angular.module('pahApp')
    .controller('BackendSandboxCtrl', function($stateParams, $state,$scope, CAHFactory, ngDialog, $http, $location, socket, deck, $cookies) {
        


        // console.log($cookies.games);
        // console.log(JSON.parse($cookies.games));

        var cookie = JSON.parse($cookies.games);
        var userId = cookie[0].userId;
        $scope.player = {};






    



        // console.log($stateParams);
        $scope.state = {};


        CAHFactory.getGameByCode($stateParams.gameid,function(state){

            $scope.state = state;
            deck.getDeck("base", function(status){
                console.log(status);
            });
            state.users.forEach(function(user){
                   if (user._id === userId) {
                    $scope.player = user;
                    cookie.forEach(function(game){
                        if (game.gameId === state._id && game.cards){
                            $scope.player.cards = game.cards;
                        } 
                    });
                   }
                });
            $scope.judge = state.users[state.currentJudge];
            socket.socket.on('pah:' + state._id, function(newstate) {
                $scope.state = state;
                state.users.forEach(function(user){
                   if (user.id === userId) {
                    $scope.player = user;
                   }
                });
                $scope.judge = state.users[state.currentJudge];

            });
        })

        $scope.drawCard = function () {
            deck.drawCard($scope.state.discardedWhite, (10 - $scope.player.cards.length), function (data) {
                var playerCards = $scope.player.cards.concat(data.cards);
                var cookies = JSON.parse($cookies.games);
                cookies.forEach(function(game){
                    if (game.gameId = $scope.state._id) {
                        game.cards = playerCards;
                    }
                })
                $scope.player.cards = playerCards; 
                $cookies.games = JSON.stringify(cookies);
                CAHFactory.draw(data.cardsWeDrew, $scope.state._id);
            });
        }


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
