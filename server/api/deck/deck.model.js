'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeckSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Deck', DeckSchema);