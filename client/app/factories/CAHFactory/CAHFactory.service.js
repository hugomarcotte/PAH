'use strict';

angular.module('pahApp')
    .factory('CAHFactory', function($http, deck) {
        var factoryMethods = {};
        var gameState = {};
        var playerIndex;
        var hand = {
            cards: []
        };
        var fakeInPlay = {
            currentJudge: 0,
            questionCard: {
                "id": 536,
                "cardType": "Q",
                "text": "What am I giving up for Lent?",
                "numAnswers": 1,
                "expansion": "Base"
            },
            cards: [{
                "id": 33,
                "cardType": "A",
                "text": "Republicans.",
                "numAnswers": 0,
                "expansion": "Base"
            }, {
                "id": 34,
                "cardType": "A",
                "text": "The Big Bang.",
                "numAnswers": 0,
                "expansion": "Base"
            }]
        };
        var isPlayer = false;

        factoryMethods.getState = function() {
            return gameState;
        };

        factoryMethods.getCurrentHand = function() {
            return hand;
        };

        factoryMethods.getCardsInPlay = function() {
            return fakeInPlay;
        };

        factoryMethods.getScoreboard = function() {
            return {
                users: gameState.users
            };
        };

        factoryMethods.getCurrentPlayer = function() {
        	return {
        		player: gameState.users[playerIndex]
        	};
        }

        factoryMethods.getPlayers = function() {
            return this.getScoreboard();
        }

        factoryMethods.init = function(playerName, callback) {
            var self = this;

            $http.post('/api/pahs/', {})
                .success(function(state) {
                    console.log('new game state: ', state);
                    if (playerName) {
                        self.join(playerName, state.code, callback);
                    } else {
                        self.spectate(state.code, callback);
                    }
                })
                .error(function(err) {
                    console.log('Failed to initialize game: ', err);
                });
        };

        factoryMethods.getGameByCode = function(code, callback) {
            var self = this;
            //console.log(code);
            $http.get('/api/pahs/'+code, {})
                .success(function(state) {
                    console.log('new game state: ', state);
                        callback(state);
                })
                .error(function(err) {
                    console.log('Failed to initialize game: ', err);
                });
        };

        factoryMethods.draw = function(cardsWeDrew, gameId) {
          $http.put('api/pahs/'+ gameId +'/draw/', {cardsWeDrew: cardsWeDrew}).success(function (data) {
            console.log(data);
          });
        };

        factoryMethods.play = function(cardId) {
            console.log('you just played card number: ', cardId);
            return;
        };

        factoryMethods.judge = function(cardId) {
            console.log('the player who played card ', cardId, ' is the winner!');
            return;
        };

        factoryMethods.spectate = function(joinCode, callback) {
            if (!joinCode) {} // Do some stuff if you were the one to init
            isPlayer = false;
        };

        factoryMethods.join = function(name, joinCode, callback) {
        		//console.log(arguments);
            if (!joinCode) {} // Do some stuff if you were the one to init

            $http.post('/api/pahs/' + joinCode, {
                    'name': name
                })
                .success(function(data) {
                    console.log(data, "DATA----");
                	if(callback) callback(data);
                	gameState = data.state;
                	gameState.users.forEach(function(user, index) {
                		if (user._id == data.playerId) playerIndex = index;
                	})
                	                })
                .error(function(err) {
                    console.log('Failed to join game: ', err);
                });
        };


        // this shouldn't be externally facing,
        // should just get called when join finds that
        // you're already in the game
        factoryMethods.rejoin = function(joinCode) {
            return;
        };


        // Public API here
        return factoryMethods;
    });
