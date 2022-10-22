'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const roleController = require("../../controllers/role.controller");
const PATH = 'role';

router.post(`/${PATH}/create`, ensureAuth, roleController.createRole);
router.get(`/${PATH}/all/:id_project`, ensureAuth, roleController.getRolesByProject);
router.put(`/${PATH}/update/:id`, ensureAuth, roleController.updateRole);
router.put(`/${PATH}/delete/:id`, ensureAuth, roleController.deleteRole);

module.exports = router;
