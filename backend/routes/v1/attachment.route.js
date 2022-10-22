'use strict'

const express = require('express');
const router = express.Router();

const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/attachments' });
const { ensureAuth } = require("../../lib/auth");
const attachmentController = require("../../controllers/attachment.controller");
const PATH = 'attachment';

router.post(`/${PATH}/create`, [ensureAuth, md_upload], attachmentController.createAttachment);
router.get(`/${PATH}/all/:id_activity`, ensureAuth, attachmentController.getAttachmentsByActivity);
router.put(`/${PATH}/update/:id`, [ensureAuth, md_upload], attachmentController.updateAttachment);
router.put(`/${PATH}/delete/:id`, ensureAuth, attachmentController.deleteAttachment);
router.get(`/${PATH}/file/:file`, ensureAuth, attachmentController.getAttachmentFile);

module.exports = router;
