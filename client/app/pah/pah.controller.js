'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, ngDialog, $stateParams, $http, $location, socket, deck, $cookies) {

        //// CAHFactory.init(playerName, callback)
        //// if you include a playerName, init will also join you to the game
        //
        //// CAHFactory.join(playerName, code, callback)
        //
        //$scope.examplePrivatePlayArea = CAHFactory.getPrivatePlayArea();
        //// access each card using exampleHand.hand[i], which is the full object
        //
        //$scope.examplePublicPlayArea = CAHFactory.getPublicPlayArea();
        //// access the public play area (not the scoreboard)
        ////
        //// {
        ////   blackCard: {},
        ////   submittedCards: [],
        ////   judgeMode: false,  // true if everyone has submitted a card?
        ////   currentJudge: {} // user info of judge
        //// }
        //
        //$scope.exampleScoreboard = CAHFactory.getScoreboard();
        //// get the scoreboard, which includes the array of all players
        //
        //$scope.exampleMe = CAHFactory.getCurrentPlayer();
        //console.log($scope.exampleMe);
        //// get the current player's info
        //// {
        ////   info: {this is the player object},
        ////   index: 4 // index in users array for display porpoises
        //// }


    $scope.privatePlayArea = CAHFactory.getPrivatePlayArea();
    $scope.publicPlayArea = CAHFactory.getPublicPlayArea();
    $scope.scoreboard = CAHFactory.getScoreboard();
    $scope.currentPlayer = CAHFactory.getCurrentPlayer($stateParams.code);


    $scope.selectWhiteCard = function(whiteCard) {
      if (whiteCard.selected) {
        whiteCard.selected = false;
      } else {
        whiteCard.selected = true;
      }
    };

    $scope.submitCards = function() {
      var submittedCards =[];
      $scope.privatePlayArea.hand.forEach(function(card) {
        if (card.selected) {
          submittedCards.push(card)
        }
      });
      CAHFactory.play(submittedCards[0], $scope.currentPlayer._id);  //CAHFactory.play should be rewritten to accet an array of card objects
    };





































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
            console.log('drawing card...');
            CAHFactory.draw(10-$scope.privatePlayArea.hand.length);
        };

        $scope.oldDrawCard = function() {
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


    $scope.calStackCardsMargin = function(nbOfCards) {
      var screenSize = angular.element(document.querySelectorAll(".blackCardZone")[0])[0].clientWidth;
      // +1 at the end is a mystery but seems to be working with any number of Cards
      return Math.floor(((nbOfCards * 100) - screenSize) / (nbOfCards - 1))+1;
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
