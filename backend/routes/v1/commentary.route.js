'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const commentaryController = require("../../controllers/commentary.controller");
const PATH = 'commentary';

router.post(`/${PATH}/create`, ensureAuth, commentaryController.createCommentary);
router.get(`/${PATH}/all/:id`, ensureAuth, commentaryController.getCommentariesByActivity);
router.put(`/${PATH}/update/:id`, ensureAuth, commentaryController.updateCommentary);
router.put(`/${PATH}/delete/:id`, ensureAuth, commentaryController.deleteCommentary);

module.exports = router;
