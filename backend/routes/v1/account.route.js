'use strict'

const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/users' });

const { ensureAuth } = require("../../lib/auth");
const accountController = require("../../controllers/account.controller");
const PATH = 'account';

router.put(`/${PATH}/update/:id`, ensureAuth, accountController.updateAccount);
router.put(`/${PATH}/update-password/:id`, ensureAuth, accountController.updatePassword);
router.put(`/${PATH}/upload-image/:id`, [ensureAuth, md_upload], accountController.uploadImage);
router.put(`/${PATH}/delete-image/:id`, ensureAuth, accountController.deleteImage);
router.get(`/${PATH}/image/:imageFile`, accountController.getImageFile);

module.exports = router;
