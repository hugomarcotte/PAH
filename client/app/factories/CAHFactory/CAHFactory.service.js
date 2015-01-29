'use strict';

angular.module('pahApp')
  .factory('CAHFactory', function($http) {
    var factoryMethods = {};
    var gameId;
    var gameCode;
    var playerId;
    var isPlayer = false;
    var gameState;
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

    factoryMethods.getPlayers = function() {
      return this.getScoreboard();
    }

    factoryMethods.init = function(playerName) {
      var self = this;
      // gameState = {
      //   _id: "P4802OIN489H489",
      //   currentJudge: 0,
      //   users: [],
      //   discardedWhite: [],
      //   discardedBlack: [],
      //   cardsInPlay: []
      // };
      // gameId = gameState._id;

      $http.post('/api/pahs/', {})
        .success(function(state) {
          // console.log('new game state: ', state);
          gameState = state;
          gameId = gameState._id
          console.log('game initialized successfully');
          gameCode = gameId.substring(gameId.length-4);
          if (playerName) {
            self.join(playerName, gameCode);
          } else {
            self.spectate(gameCode);
          }
        })
        .error(function(err) {
          console.log('Failed to initialize game: ', err);
        });

      return gameState;
    };

    factoryMethods.draw = function() {
      hand.cards.push({
        "id": 18,
        "cardType": "A",
        "text": "Being on fire.",
        "numAnswers": 0,
        "expansion": "Base"
      });
      return hand;
    };

    factoryMethods.play = function(cardId) {
      console.log('you just played card number: ', cardId);
      return;
    };

    factoryMethods.judge = function(cardId) {
      console.log('the player who played card ', cardId, ' is the winner!');
      return;
    };

    factoryMethods.spectate = function(joinCode) {
      if (!joinCode) {} // Do some stuff if you were the one to init
      isPlayer = false;
      gameState = {
        _id: "P4802OIN489H489",
        currentJudge: 0,
        users: [{
          name: "Griffin",
          points: 0,
          // isDealer: Boolean,
          hand: [0, 1, 2, 3, 4, 5, 6]
        }, {
          name: name,
          points: 0,
          hand: [24, 25, 26, 27]
        }],
        discardedWhite: [],
        discardedBlack: []
      };
    };

    factoryMethods.join = function(name, joinCode) {
      if (!joinCode) {} // Do some stuff if you were the one to init
      isPlayer = true;

      playerId = 1;
      gameState = {
        _id: "P4802OIN489H489",
        currentJudge: 0,
        users: [{
          name: "Griffin",
          points: 0,
          // isDealer: Boolean,
          hand: [0, 1, 2, 3, 4, 5, 6]
        }, {
          name: name,
          points: 0,
          hand: [24, 25, 26, 27]
        }],
        discardedWhite: [],
        discardedBlack: []
      };

      hand = {
        cards: [

          {
            "id": 24,
            "cardType": "A",
            "text": "The Rapture.",
            "numAnswers": 0,
            "expansion": "Base"
          }, {
            "id": 25,
            "cardType": "A",
            "text": "Pterodactyl eggs.",
            "numAnswers": 0,
            "expansion": "Base"
          }, {
            "id": 26,
            "cardType": "A",
            "text": "Crippling debt.",
            "numAnswers": 0,
            "expansion": "Base"
          }, {
            "id": 27,
            "cardType": "A",
            "text": "Eugenics.",
            "numAnswers": 0,
            "expansion": "Base"
          }
        ]
      };

      $http.post('/api/pahs/' + joinCode, {
          'name': name
        })
        .success(function(data) {
          gameState = data.state;
          gameId = gameState._id;
          gameState.users.forEach(function(player, index) {
            if (player._id == data.playerId) {
              playerId = index;
            }
          });
          hand = []; // Make the hand...
        })
        .error(function(err) {
          console.log('Failed to join game: ', err);
        });



      return gameState;
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