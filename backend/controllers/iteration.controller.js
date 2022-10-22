'use strict'

const Iteration = require('../models/iteration.model');
const IterationController = {};

//Crear iIteración
IterationController.createIteration = (req, res) => {
    let iteration = new Iteration({ ...req.body });
    let validate = iteration.joiValidate({ ...req.body });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        iteration.save()
            .then((newIteration) => {
                if (!newIteration) {
                    return res.status(500).send({ msg: 'No se puedo registrar la iteración' });
                } else {
                    return res.status(200).send({ iteration: newIteration });
                }
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al registrar iteración' });
            });
    }
};

//Obtener listado de iterations por proyecto
IterationController.getIterationsByProject = (req, res) => {
    Iteration.find({
        $and: [
            { active: true },
            { project: req.params.id_project }
        ]
    })
        .then((iterations) => {
            return res.status(200).send(iterations);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver iteraciones' });
        });
};

// Obtener iteración
IterationController.getIteration = (req, res) => {
    Iteration.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró la iteración' });
            } else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al obtener la iteración' });
        });
};

//Actualizar Iteración
IterationController.updateIteration = (req, res) => {
    Iteration.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró la iteración' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado la información de la iteración con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar la iteración' });
        });
};

//Dar de baja Iteración
IterationController.deleteIteration = (req, res) => {
    Iteration.findOneAndUpdate({ _id: req.params.id }, { active: false })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró la iteración' });
            } else {
                return res.status(200).send({ msg: 'Se ha eliminado la iteración con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar la iteración' });
        });
};

//Asignar Calificación a la iteración
IterationController.assingScore = (req, res) => {
    if (req.body.score > 0 && req.body.score <= process.env.MAX_SCORE) {
        Iteration.findOneAndUpdate({ _id: req.params.id }, { score: req.body.score })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ msg: 'No se encontró la iteración' });
                } else {
                    return res.status(200).send({ msg: 'Se asignó la calificación correctamente' })
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send({ msg: 'Error al asignar calificación a la iteración' });
            });
    } else {
        return res.status(400).send({ msg: 'No se ingresó una calificación válida' });
    }
};


module.exports = IterationController;

