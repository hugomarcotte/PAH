'use strict';

var express = require('express');
var controller = require('./pah.controller');

var router = express.Router();


router.post('/', controller.createPahGame);
router.get('/:id', controller.joinPahGame);
router.get('/:id/draw/:user', controller.drawCard);
router.put('/:id/submit/:user', controller.submit);
router.put('/:id/judge/', controller.judge);


module.exports = router;