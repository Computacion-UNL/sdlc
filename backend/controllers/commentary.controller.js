'use strict'

const Commentary = require('../models/commentary.model');
const CommentaryController = {};

//Añadir Comentario
CommentaryController.createCommentary = (req, res) => {
    let commentary = new Commentary({ ...req.body, author: req.user.id });
    let validate = commentary.joiValidate({ ...req.body, author: req.user.id });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        commentary.save()
            .then((newCommentary) => {
                if (!newCommentary) {
                    return res.status(500).send({ msg: 'No se puedo añadir el comentario' });
                } else {
                    return res.status(200).send({ commentary: newCommentary });
                }
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al añadir el comentario' });
            });
    }
};

//Obtener listado de commentarios por actividad
CommentaryController.getCommentariesByActivity = (req, res) => {
    Commentary.find({
        $and: [
            { active: true },
            { activity: req.params.id }
        ]
    })
        .populate('author')
        .then((commentaries) => {
            return res.status(200).send(commentaries);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver comentarios' });
        });
};

//Actualizar Comentario
CommentaryController.updateCommentary = (req, res) => {
    Commentary.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el comentario' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado el comentario con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el comentario' });
        });
};

//Dar de baja Comentario
CommentaryController.deleteCommentary = (req, res) => {
    Commentary.findOneAndUpdate({ _id: req.params.id }, { active: false })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el comentario' });
            } else {
                return res.status(200).send({ msg: 'Se ha eliminado el comentario con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar el comentario' });
        });
};

module.exports = CommentaryController;

