'use strict';

var express = require('express');
var controller = require('./pah.controller');

var router = express.Router();


router.post('/', controller.create);
router.get('/:code', controller.show);
router.post('/:code', controller.join);
router.put('/:id/draw/', controller.draw);
router.put('/:id/submit/:user', controller.submit);
router.put('/:id/judge/', controller.judge);


module.exports = router;