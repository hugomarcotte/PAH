'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PahSchema = new Schema({
  code: String,
  info: String,
  active: Boolean,
  host: String,
  currentJudge: {type:Number, default:0},
  currentDrawingUser: {type:Number, default:-1},
  users: {type:Array, default:[]},
  discardedWhite: {type:Array, default:[]},
  mostRecentWin: {type: Array, default:[]},
  mostRecentBlack: {type: Object, default:{}},
  discardedBlack: {type:Array, default:[]},
  cardsInPlay: {type:Array, default:[]},
  blackCard: {type: Object, default:{}},
  judgeMode: {type:Boolean, default:false}
});

module.exports = mongoose.model('Pah', PahSchema);