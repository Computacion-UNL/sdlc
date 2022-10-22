'use strict'
const fs = require('fs');
const path = require('path');
// const cloudinary = require('../lib/cloudinary');

const Attachment = require('../models/attachment.model');
const AttachmentController = {};

//Añadir Adjunto
AttachmentController.createAttachment = (req, res) => {
    let attachment = new Attachment({ ...req.body });
    let validate = attachment.joiValidate({
        name: req.body.name,
        type: req.body.type,
        activity: req.body.activity
    });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        attachment.save()
            .then(async (newAttachment) => {
                if (!newAttachment) {
                    return res.status(500).send({ msg: 'No se puedo añadir el adjunto' });
                } else {
                    if (newAttachment.type === "file") {
                        if (req.files) {
                            try {
                                // const result = await cloudinary.cloudinaryUpload(req.files.file.path);
                                // let fileExt = result.format;
                                let filePath = req.files.file.path;
                                let fileSplit = (process.platform == 'linux') ?  filePath.split('\\') : filePath.split('\/');
                                let fileName = fileSplit[fileSplit.length - 1];
                                let extSplit = fileName.split('\.');
                                var fileExt = extSplit[1];

                                if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpge' || fileExt == 'JPG' || fileExt == 'pdf') {
                                    Attachment.updateOne({ _id: newAttachment._id }, { url:  fileName })
                                        .then(attachmentUpdate => {
                                            if (!attachmentUpdate) {
                                                return res.status(404).send({ msg: 'No se pudo subir el adjunto' });
                                            } else {
                                                return res.status(200).json(attachmentUpdate);
                                            }
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            return res.status(500).send({ msg: 'Error al subir el adjunto' });
                                        });
                                } else {
                                 //   return res.status(400).send({ msg: 'La extensión no es válida' });
                                    fs.unlink(filePath, (err) => {
                                        console.log(err);
                                        return res.status(400).send({ msg: 'La extensión no es válida' });
                                    });
                                }
                            } catch (error) {
                                console.log(error);
                                return res.status(500).send({ msg: 'Error al subir el adjunto' });
                            }
                        }
                    } else {
                        return res.status(200).json(newAttachment);
                    }
                }
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al añadir el adjunto' });
            });
    }
};

//Obtener listado de adjuntos por actividad
AttachmentController.getAttachmentsByActivity = (req, res) => {
    Attachment.find({
        $and: [
            { active: true },
            { activity: req.params.id_activity }
        ]
    })
        .then((attachments) => {
            return res.status(200).send(attachments);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver adjuntos' });
        });
};

//Actualizar Adjunto
AttachmentController.updateAttachment = async(req, res) => {
    let attachment = { ...req.body }
    if (req.files) {
        try {
            // const result = await cloudinary.cloudinaryUpload(req.files.file.path);
            let fileExt = result.format;

            if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpge' || fileExt == 'JPG' || fileExt == 'pdf') {
                attachment.url =  result.secure_url;
            } else {
                fs.unlink(filePath, (err) => {
                    console.log(err);
                    return res.status(200).send({ msg: 'La extensión no es válida' });
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({ msg: 'Error al subir el adjunto' });
        }
    }
    Attachment.findOneAndUpdate({ _id: req.params.id }, attachment)
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el adjunto' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado el adjunto con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el adjunto' });
        });
};

//Obtener archivo adjunto
AttachmentController.getAttachmentFile = (req, res) => {
    let path_file = './uploads/attachments/' + req.params.file;
    fs.stat(path_file, (error) => {
        if (!error) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(204).send({
                msg: 'No existe el archivo'
            });
        }
    });
};


//Dar de baja Adjunto
AttachmentController.deleteAttachment = (req, res) => {
    Attachment.findOneAndUpdate({ _id: req.params.id }, { active: false })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el adjunto' });
            } else {
                return res.status(200).send({ msg: 'Se ha eliminado el adjunto con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar el adjunto' });
        });
};

module.exports = AttachmentController;

