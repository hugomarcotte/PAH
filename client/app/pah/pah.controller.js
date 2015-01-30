'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, $http, $location, socket, deck) {
        $scope.message = 'Hello';

        $scope.users = [{name:'Hugo'}, {name:'Christian'}];

        deck.getDeck('base', function() {
            $scope.deck = deck.getCurrentDeck();
            //console.log($scope.deck);
        })

        $scope.awesomeThings = [];

        $http.get('/api/things').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            socket.syncUpdates('thing', $scope.awesomeThings, function(event, item, array) {
                // speak(item.text, function() {
                //     console.log('done');
                // })
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
    });
