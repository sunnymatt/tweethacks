'use strict';

var express = require('express');
var controller = require('./twitter.controller');

var router = express.Router();

router.get('/', controller.test);
console.log('sweg');

module.exports = router;
