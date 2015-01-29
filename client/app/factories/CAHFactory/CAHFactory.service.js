'use strict';

angular.module('pahApp')
  .factory('CAHFactory', function() {
    var gameId;
    var isPlayer = false;
    var factoryMethods = {};
    var gameState;
    var hand;
    var fakeInPlay = [{
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
    }];

    factoryMethods.getCurrentHand = function() {
      return hand;
    };

    factoryMethods.getCardsInPlay = function() {
      return fakeInPlay;
    };

    factoryMethods.getScoreboard = function() {
      return gameState.players;
    };

    factoryMethods.init = function() {
      gameState = {
        _id: "P4802OIN489H489",
        currentJudge: 0,
        players: [{
          name: "Griffin",
          points: 0,
          // isDealer: Boolean,
          hand: [0, 1, 2, 3, 4, 5, 6]
        }],
        discardedWhite: [],
        discardedBlack: [],
        cardsInPlay: []
      };
      gameId = gameState._id;
      console.log('game initialized successfully');
      return;
    };

    factoryMethods.draw = function() {
      return {
        "id": 18,
        "cardType": "A",
        "text": "Being on fire.",
        "numAnswers": 0,
        "expansion": "Base"
      };

    };

    factoryMethods.play = function(cardId) {
      console.log('you just played card number: ', cardId);
      return;
    };

    factoryMethods.judge = function(cardId) {
      console.log('the player who played card ', cardId, ' is the winner!');
      return;
    };

    factoryMethods.join = function(name, joinCode) {
      isPlayer = true;
      gameState = {
        _id: "P4802OIN489H489",
        currentJudge: 0,
        players: [{
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
    };

    factoryMethods.rejoin = function(playerId, joinCode) {
      return;
    };


    // Public API here
    return factoryMethods;
  });