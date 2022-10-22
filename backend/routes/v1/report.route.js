'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const reportController = require("../../controllers/report.controller");
const PATH = 'report';

router.get(`/${PATH}/generate/:id`, ensureAuth, reportController.generateReport);
router.get(`/${PATH}/info/:id`, ensureAuth, reportController.getInformationForReport);
router.get(`/${PATH}/generate-iteration/:id`, ensureAuth, reportController.generateIterationReport);

module.exports = router;
