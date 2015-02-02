'use strict';

angular.module('pahApp')
.controller('PahCtrl', function($scope, CAHFactory, $stateParams, $http, $location, socket, deck, $cookies) {

    // console.log($cookies.games);
        //console.log(JSON.parse($cookies.games));
            var cookie = JSON.parse($cookies.games);
            var userId = cookie[0].userId;
            if (cookie[0].cards) {
                $scope.whiteCards = cookie[0].cards;
            }

        $scope.player = {};
        //console.log($stateParams, "STATE PARAMS");




        CAHFactory.getGameByCode($stateParams.code, function(state) {

            $scope.state = state;
            state.users.forEach(function(user) {
                    // console.log("forEach got here!!!!!!!")
                    // console.log("userID is---", userId)
                    // console.log("otherUser---",user._id)
                    if (user._id === userId) {
                        //console.log("got here!!!!!!!")
                        $scope.player = user;
                    }
                });
            $scope.judge = state.users[state.currentJudge];
            console.log("THIS IS THE STATE", $scope.state)
            deck.getDeck("base", function(status) {
                console.log(status);
            });
            state.users.forEach(function(user) {
                if (user._id === userId) {
                    $scope.player = user;
                    cookie.forEach(function(game) {
                        if (game.gameId === state._id && game.cards) {
                            $scope.player.cards = game.cards;
                        }
                    });
                }
            });
            $scope.judge = state.users[state.currentJudge];
            socket.socket.on('pah:' + state._id, function(newstate) {
                $scope.state = state;
                console.log(state, "STATE")
                state.users.forEach(function(user) {
                    if (user.id === userId) {
                        $scope.player = user;
                    }
                });
                $scope.judge = state.users[state.currentJudge];
            });
        })

$scope.drawCard = function() {
 deck.drawCard($scope.state.discardedWhite, (10 - $scope.player.cards.length), function (data) {
    $scope.whiteCards = $scope.player.cards.concat(data.cards);
    var cookies = JSON.parse($cookies.games);
    cookies.forEach(function(game){
        if (game.gameId = $scope.state._id) {
            game.cards = $scope.whiteCards;
        }
    })
                // $scope.player.cards = playerCards;
                $cookies.games = JSON.stringify(cookies);
                CAHFactory.draw(data.cardsWeDrew, $scope.state._id);
            });
}




$scope.gameCode = $stateParams.code;




        // $scope.whiteCards =[{"id":12,"cardType":"A","text":"Puppies!","numAnswers":0,"expansion": "Base"},
        // {"id":13,"cardType":"A","text":"A windmill full of corpses.","numAnswers":0,"expansion": "Base"},
        // {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        // {"id":15,"cardType":"A","text":"Racially-biased SAT questions.","numAnswers":0,"expansion": "Base"},
        // {"id":16,"cardType":"A","text":"Dying.","numAnswers":0,"expansion": "Base"},{"id":12,"cardType":"A","text":"Puppies!","numAnswers":0,"expansion": "Base"},
        // {"id":13,"cardType":"A","text":"A windmill full of corpses.","numAnswers":0,"expansion": "Base"},
        // {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        // {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"},
        // {"id":14,"cardType":"A","text":"Guys who don't call.","numAnswers":0,"expansion": "Base"}]

        $scope.blackCard = {
            "id": 12,
            "cardType": "A",
            "text": "As part of his daily regimen, Anderson Cooper sets aside 15 minutes for ___________",
            "numAnswers": 0,
            "expansion": "Base"
        };

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