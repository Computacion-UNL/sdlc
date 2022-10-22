'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require('../../lib/auth');
const settingController = require('../../controllers/setting.controller');
const PATH = 'setting';

router.post(`/${PATH}/create/:slug`, ensureAuth, settingController.createOrUpdateSetting);
router.get(`/${PATH}/all`, ensureAuth, settingController.getAllSettings);
router.get(`/${PATH}/get/:slug`, ensureAuth, settingController.getSettingBySlug);

module.exports = router;