'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PahSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  host: String,
  currentJudge: Number,
  users: Array,
  discardedWhite: Array,
  cardsInPlay: Array,
  blackCard: Object
});

module.exports = mongoose.model('Pah', PahSchema);