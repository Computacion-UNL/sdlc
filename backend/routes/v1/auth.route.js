'use strict'

const express = require('express');
const router = express.Router();
const { ensureAuth } = require("../../lib/auth");

const authController = require("../../controllers/auth.controller");
const PATH = 'auth';

router.post(`/${PATH}/signup`, authController.signup);
router.post(`/${PATH}/signin`, authController.signin);
router.post(`/${PATH}/recovery`, authController.recovery);
router.get(`/${PATH}/get-data`, ensureAuth, authController.getData);
router.post(`/${PATH}/resend`, authController.resend_activation);
router.post(`/${PATH}/verify/:email`, authController.verify_account);

module.exports = router;
