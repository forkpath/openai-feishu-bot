const express = require('express');
const validate = require('../middleware/validate.mw');
const validation = require('../schemas');
const msgController = require('../controllers/msg.ctl');

const router = express.Router();

// 处理消息，并给出答复
router.post('', validate(validation.msgParam), msgController.asyncAnswer);

module.exports = router;

