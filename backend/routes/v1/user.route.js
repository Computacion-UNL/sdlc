'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const userController = require("../../controllers/user.controller");
const PATH = 'user';

router.get(`/${PATH}/all`, ensureAuth, userController.getUsers);
router.get(`/${PATH}/:id`, ensureAuth, userController.getUser);
router.put(`/${PATH}/update-status/:id`, ensureAuth, userController.updateStatus);
router.post(`/${PATH}/search`, ensureAuth, userController.searchUser);

module.exports = router;
