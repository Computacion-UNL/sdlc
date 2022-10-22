'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const collaboratorController = require("../../controllers/collaborator.controller");
const PATH = 'collaborator';

router.post(`/${PATH}/create`, ensureAuth, collaboratorController.addCollaboratorToProject);
router.get(`/${PATH}/all/:id_project`, ensureAuth, collaboratorController.getCollaborators);
router.get(`/${PATH}/get/:id_project/:id_user`, ensureAuth, collaboratorController.getCollaboratorByProject);
router.get(`/${PATH}/all-projects/:id_user`, ensureAuth, collaboratorController.getProyectsByCollaborator);
router.post(`/${PATH}/search-projects/:id_user`, ensureAuth, collaboratorController.searchProyectsByCollaborator);
router.get(`/${PATH}/invitation/:id`,  ensureAuth, collaboratorController.getCollaborator);
router.put(`/${PATH}/update/:id`, ensureAuth, collaboratorController.updateCollaborator);
router.put(`/${PATH}/delete/:id`, ensureAuth, collaboratorController.deleteCollaborator);

module.exports = router;
