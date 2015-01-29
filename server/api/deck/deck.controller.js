'use strict';

var _ = require('lodash');
var Deck = require('./deck.model');

var decks = {
	master: require('../../decks/cards_against_humanity/master_cards'),
	base: require('../../decks/cards_against_humanity/base').white
}

// Get list of decks
exports.index = function(req, res) {
  return res.json(200, master);
};

// Get a single deck
exports.show = function(req, res) {
		console.log(req.query.expansion);
		if(req.query.expansion){
			return res.json(decks[req.query.expansion]);
		}
		else{
			return res.json(master);
		}
};

// Creates a new deck in the DB.
exports.create = function(req, res) {
  Deck.create(req.body, function(err, deck) {
    if(err) { return handleError(res, err); }
    return res.json(201, deck);
  });
};

// Updates an existing deck in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Deck.findById(req.params.id, function (err, deck) {
    if (err) { return handleError(res, err); }
    if(!deck) { return res.send(404); }
    var updated = _.merge(deck, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, deck);
    });
  });
};

// Deletes a deck from the DB.
exports.destroy = function(req, res) {
  Deck.findById(req.params.id, function (err, deck) {
    if(err) { return handleError(res, err); }
    if(!deck) { return res.send(404); }
    deck.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}