'use strict'

const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/projects' });

const { ensureAuth } = require("../../lib/auth");
const projectController = require("../../controllers/project.controller");
const PATH = 'project';

router.post(`/${PATH}/create`, ensureAuth, projectController.createProject);
router.post(`/${PATH}/search`, ensureAuth, projectController.searchProjectsByUser);
router.post(`/${PATH}/all`, ensureAuth, projectController.getProjectsByUser);
router.get(`/${PATH}/:id`, ensureAuth, projectController.getProject);
router.put(`/${PATH}/update/:id`, ensureAuth, projectController.updateProject);
router.put(`/${PATH}/upload-image/:id`, [ensureAuth, md_upload], projectController.uploadImage);
router.put(`/${PATH}/delete-image/:id`, ensureAuth, projectController.deleteImage);
router.get(`/${PATH}/image/:imageFile`, projectController.getImageFile);
router.put(`/${PATH}/delete/:id`, ensureAuth, projectController.deleteProject);

module.exports = router;
