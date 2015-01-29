'use strict';

angular.module('pahApp')
    .controller('MainCtrl', function($scope, CAHFactory, ngDialog, $location, socket, deck) {

        $scope.test = 'test1';


        $scope.startNow = function() {
            ngDialog.open({
                template: 'startGameDialog',
                controller: 'MainCtrl'
            });
        };

        deck.getDeck('base', function() {
            $scope.deck = deck.getCurrentDeck();
            console.log($scope.deck);
        })

        $scope.awesomeThings = [];

        $http.get('/api/things').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            socket.syncUpdates('thing', $scope.awesomeThings, function(event, item, array) {
                speak(item.text, function() {
                    console.log('done');
                })
            });
        });


        $scope.addThing = function() {
            if ($scope.newThing === '') {
                return;
            }
            $http.post('/api/things', {
                name: $scope.newThing
            });
            $scope.newThing = '';
        };

        $scope.deleteThing = function(thing) {
            $http.delete('/api/things/' + thing._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('thing');
        });

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
                CAHFactory.init();
                CAHFactory.join($scope.playerName);
            }
            // Create and join as spectator
            else {
                CAHFactory.init();
                CAHFactory.spectate();
            }

            $location.path('/pah');
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
