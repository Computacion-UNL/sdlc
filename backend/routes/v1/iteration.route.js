'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const iterationController = require("../../controllers/iteration.controller");
const PATH = 'iteration';

router.post(`/${PATH}/create`, ensureAuth, iterationController.createIteration);
router.get(`/${PATH}/all/:id_project`, ensureAuth, iterationController.getIterationsByProject);
router.get(`/${PATH}/get/:id`, ensureAuth, iterationController.getIteration);
router.put(`/${PATH}/update/:id`, ensureAuth, iterationController.updateIteration);
router.put(`/${PATH}/delete/:id`, ensureAuth, iterationController.deleteIteration);
router.put(`/${PATH}/assign-score/:id`, ensureAuth, iterationController.assingScore);

module.exports = router;
