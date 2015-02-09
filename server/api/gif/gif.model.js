'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GifSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Gif', GifSchema);