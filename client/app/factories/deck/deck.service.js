'use strict';

angular.module('pahApp')
  .factory('deck', function($http) {

    var current_deck = [];

    // Public API here
    return {
      getDeck: getDeck,
      getCurrentDeck: function() {
        return current_deck;
      },
      drawCard: drawCard,
      populate: populate
    };

    function getDeck(type) {
      var param = '';
      if (!type) type = 'base';
      if (type) param = '/?expansion=' + type;
      return $http.get('/api/decks/CAH' + param)
        .success(function(deck) {
          current_deck = deck;
          // cb(200);
        })
        .error(function(err) {
          console.log(err);
          // cb(404);
        });
    }

    function drawCard(discardedCards, numToDraw, cb) {


      var data = {
        cards: [],
        cardsWeDrew: []
      };

      //console.log(current_deck, "RAEHSRFDASBFDASFKJDASFKDSAJFDASF");

      var availableWhiteCards = current_deck.filter(function(whiteCard) {
          //console.log(whiteCard);
          return discardedCards.indexOf(whiteCard.id) === -1
        })
        //console.log(availableWhiteCards, "THAT IS AVAILABLE WHTIE CARDS");


      for (var i = 0; i < numToDraw; i++) {
        var randomNumber = Math.floor(Math.random() * availableWhiteCards.length);
        data.cards.push(availableWhiteCards[randomNumber]);
        data.cardsWeDrew.push(availableWhiteCards[randomNumber].id);
        availableWhiteCards.splice(randomNumber, 1);
        // we are not handeling the end of the deck
      }

      // console.log(current_deck.length);
      // console.log(availableWhiteCards);
      if (cb) cb(data);
      return data;
    }


    // return full card objects related to those cardIds
    function populate(cardIds) {
      return current_deck.filter(function(whiteCard) {
        return cardIds.indexOf(whiteCard.id) !== -1;
      });
    }

  });