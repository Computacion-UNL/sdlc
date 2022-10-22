'use strict'

const fs = require('fs');
const path = require('path');
// const cloudinary = require('../lib/cloudinary');
const { passwordStrength } = require('check-password-strength');

const helper = require('../lib/helper');
const User = require('../models/user.model');
const AccountController = {};

//Actualizar Datos de Cuenta
AccountController.updateAccount = (req, res) => {
    User.findOne({ email: req.body.email, _id: { $ne: req.params.id } })
        .then((user) => {
            if (user) {
                return res.status(400).send({ msg: 'Ya existe el correo' });
            } else {
                User.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
                    .then(result => {
                        if (!result) {
                            return res.status(404).send({ msg: 'No se pudo encontrar el usuario' });
                        } else {
                            return res.status(200).send({ msg: 'Se ha actualizado la información del usuario con éxito' });
                        }
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).send({ msg: 'Error al actualizar el usuario' });
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el usuario' });
        });
};

//Actualizar Contraseña de Cuenta
AccountController.updatePassword = (req, res) => {
    User.findOne({ _id: req.params.id })
        .then(account => {
            if (helper.matchPassword(req.body.oldPassword, account.password)) {
                if (passwordStrength(req.body.newPassword).id === 0 || passwordStrength(req.body.newPassword).id === 1) {
                    return res.status(400).send({
                        msg: `Contraseña Débil. Se debe incluir mayúsculas, minúsculas, caracteres, números y tener como mínimo 8 caracteres`
                    });
                } else {
                    const hash = helper.generateHash(req.body.newPassword);
                    const update = {};
                    update.password = hash;
                    User.findOneAndUpdate({ _id: req.params.id }, update)
                        .then(account => {
                            if (!account) return res.status(404).send({ message: "No se encontro la cuenta" });
                            else return res.status(200).send({ msg: 'Se ha actulizado la contraseña con éxito' });
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(500).send({ msg: 'Error al actualizar el usuario' });
                        });
                }
            } else {
                return res.status(500).send({ message: "La contraseña no es correcta" });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el usuario' });
        });
};

//Subir Imagen Usuario
AccountController.uploadImage = async (req, res) => {
    if (req.files) {
        // const result = await cloudinary.cloudinaryUpload(req.files.image.path);
        // let fileExt = result.format;
        let filePath = req.files.image.path;
        let fileSplit = (process.platform == 'linux') ?  filePath.split('\\') : filePath.split('\/');
        let fileName = fileSplit[fileSplit.length - 1];
        let extSplit = fileName.split('\.');
        var fileExt = extSplit[1];


        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpge' || fileExt == 'JPG') {
            User.updateOne({ _id: req.params.id }, { image: fileName })
                .then(accountUpdate => {
                    if (!accountUpdate) {
                        return res.status(404).send({ msg: 'No se pudo encontrar el usuario' });
                    } else {
                        return res.status(200).json(accountUpdate);
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).send({ msg: 'Error al subir imagen' });
                });
        } else {
            fs.unlink(filePath, (err) => {
                console.log(err);
                return res.status(200).send({ msg: 'La extensión no es válida' });
            });
        }
     }
};

//Obtener imagen de usuario
AccountController.getImageFile = (req, res) => {
    let path_file = './uploads/users/' + req.params.imageFile;
    fs.stat(path_file, (error) => {
        if (!error) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(204).send({
                msg: 'No existe la imagen'
            });
        }
    });
};

//Eliminar Imagen de usuario
AccountController.deleteImage = (req, res) => {
    User.updateOne({ _id: req.params.id }, { image: null })
        .then(accountUpdate => {
            if (!accountUpdate) {
                return res.status(404).send({ msg: 'No se pudo encontrar el usuario' });
            } else {
                return res.status(200).json({ msg: 'Se ha eliminado la imagen correctamente' });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar la imagen' });
        });
};

module.exports = AccountController;
