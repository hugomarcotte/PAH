'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, ngDialog, $stateParams, $http, $location, socket, deck, $cookies) {

        // CAHFactory.init(playerName, callback)
        // if you include a playerName, init will also join you to the game

        // CAHFactory.join(playerName, code, callback)

        $scope.examplePrivatePlayArea = CAHFactory.getPrivatePlayArea();
        // access each card using exampleHand.hand[i], which is the full object

        $scope.examplePublicPlayArea = CAHFactory.getPublicPlayArea();
        // access the public play area (not the scoreboard)
        // 
        // {
        //   blackCard: {},
        //   submittedCards: [],
        //   judgeMode: false,  // true if everyone has submitted a card?
        //   currentJudge: {} // user info of judge
        // }

        $scope.exampleScoreboard = CAHFactory.getScoreboard();
        // get the scoreboard, which includes the array of all players

        $scope.exampleMe = CAHFactory.getCurrentPlayer($stateParams.code);
        // get the current player's info 
        // {
        //   info: {this is the player object},
        //   index: 4 // index in users array for display porpoises
        // }


        $scope.url = $location.absUrl();


        // console.log($cookies.games);
        //console.log(JSON.parse($cookies.games));
        // var cookie = JSON.parse($cookies.games);
        // var userId = cookie[0].userId;
        // if (cookie[0].cards) {
        //     $scope.whiteCards = cookie[0].cards;
        // }

        $scope.player = {};
        //console.log($stateParams, "STATE PARAMS");



        // CAHFactory.getGameByCode($stateParams.code, function(state) {

        //     $scope.state = state;
        //     state.users.forEach(function(user) {
        //         // console.log("forEach got here!!!!!!!")
        //         // console.log("userID is---", userId)
        //         // console.log("otherUser---",user._id)
        //         if (user._id === userId) {
        //             //console.log("got here!!!!!!!")
        //             $scope.player = user;
        //         }
        //     });
        //     $scope.judge = state.users[state.currentJudge];
        //     console.log("THIS IS THE STATE", $scope.state)
        //     deck.getDeck("base", function(status) {
        //         console.log(status);
        //     });
        //     state.users.forEach(function(user) {
        //         if (user._id === userId) {
        //             $scope.player = user;
        //             // cookie.forEach(function(game) {
        //             //     if (game.gameId === state._id && game.cards) {
        //             //         $scope.player.cards = game.cards;
        //             //     }
        //             // });
        //         }
        //     });
        //     $scope.judge = state.users[state.currentJudge];
        //     // socket.socket.on('pah:' + state._id, function(newstate) {
        //     //     $scope.state = state;
        //     //     console.log(state, "STATE")
        //     //     state.users.forEach(function(user) {
        //     //         if (user.id === userId) {
        //     //             $scope.player = user;
        //     //         }
        //     //     });
        //     //     $scope.judge = state.users[state.currentJudge];
        //     // });
        // })

        $scope.drawCard = function() {
            deck.drawCard($scope.state.discardedWhite, (10 - $scope.player.cards.length), function(data) {
                $scope.whiteCards = $scope.player.cards.concat(data.cards);
                // var cookies = JSON.parse($cookies.games);
                // cookies.forEach(function(game) {
                //         if (game.gameId == $scope.state._id) {
                //             game.cards = $scope.whiteCards;
                //         }
                //     })
                // $scope.player.cards = playerCards;
                // $cookies.games = JSON.stringify(cookies);
                CAHFactory.draw(data.cardsWeDrew, $scope.state._id);
            });
        }


        $scope.gameCode = $stateParams.code;

        $scope.join = function() {
            CAHFactory.join('John', $scope.gameCode);
        }


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

        $scope.openLinkDialog = function() {
            console.log('hey');
            ngDialog.open({
                template: 'getLinkDialog',
                controller: 'PahCtrl'
            });
        };


        $scope.calculateMargin = function(nbOfCards) {

            //console.log(angular.element(document.querySelectorAll(".blackCardZone")[0])[0]);
            var screenSize = angular.element(document.querySelectorAll(".blackCardZone")[0])[0].clientWidth;
            // console.log(screenSize);
            // console.log(nbOfCards);
            // console.log(Math.ceil(((nbOfCards * 100) - screenSize) / (nbOfCards - 1)));
            var test = Math.ceil(((nbOfCards * 100) - screenSize) / (nbOfCards - 1));
            var test2 = screenSize - test;

            return Math.ceil(((nbOfCards * 100) - test2) / (nbOfCards - 1));
        };

        $scope.sendText = function() {
            $http.post('/api/pahs/invite', {
                    phoneNumber: $scope.phoneNumber,
                    link: $scope.url
                })
                .success(function(data) {
                    console.log('successfully texted');
                    ngDialog.close();
                })
        };
    });