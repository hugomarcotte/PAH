'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, $stateParams, $http, $location, socket, deck) {


        $scope.gameCode = $stateParams.code;
        $scope.users = [{name:'Hugo', score:10}, {name:'Christian', score:25}, {name:'Ben', score:10}, {name:'Sam', score:10}, {name:'Griffin', score:10}];

        $scope.whiteCards =[{"id":12,"cardType":"A","text":"Puppies!","numAnswers":0,"expansion": "Base"},
        {"id":13,"cardType":"A","text":"A windmill full of corpses.","numAnswers":0,"expansion": "Base"},
        {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        {"id":15,"cardType":"A","text":"Racially-biased SAT questions.","numAnswers":0,"expansion": "Base"},
        {"id":16,"cardType":"A","text":"Dying.","numAnswers":0,"expansion": "Base"},{"id":12,"cardType":"A","text":"Puppies!","numAnswers":0,"expansion": "Base"},
        {"id":13,"cardType":"A","text":"A windmill full of corpses.","numAnswers":0,"expansion": "Base"},
        {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"}]

        $scope.blackCard = {"id":12,"cardType":"A","text":"As part of his daily regimen, Anderson Cooper sets aside 15 minutes for ___________","numAnswers":0,"expansion": "Base"};

        $scope.isJudge = true;

        

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
