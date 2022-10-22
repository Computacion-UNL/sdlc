'use strict'

const Activity = require('../models/activity.model');
const Change = require('../models/change.model');
const mongoose = require('mongoose');
const ActivityController = {};

//Crear Actividad, Subactividad e Incidencia
ActivityController.createActivity = (req, res) => {
    let activity = new Activity({ ...req.body });
    let validate = activity.joiValidate({ ...req.body });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        activity.save()
            .then((newActivity) => {
                if (!newActivity) {
                    return res.status(500).send({ msg: 'No se puedo registrar la actividad' });
                } else {
                    return res.status(200).send({ activity: newActivity });
                }
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al registrar la actividad' });
            });
    }
};

//Obtener actividades, subactividades e incidencias de un usuario
ActivityController.getActivitiesByUser = (req, res) => {
    Activity.find({ active: true, responsable: req.user.id })
        .populate('project')
        .then((activities) => {
            return res.status(200).send(activities);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las actividades' });
        });
}


//Obtener todas las actividades del proyecto
ActivityController.getAllActivities = (req, res) => {
    Activity.find({ active: true, project: req.params.id })
        .populate('responsable')
        .populate('iteration')
        .then((activities) => {
            return res.status(200).send(activities);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las actividades' });
        });
};

//Obtener listado de actividades por proyecto o iteración
ActivityController.getActivities = (req, res) => {
    Activity.find({ active: true, iteration: req.params.id, parent: null })
        .populate('responsable')
        .then((activities) => {
            return res.status(200).send(activities);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las actividades' });
        });
};

ActivityController.getActiveActivities = (req, res) => {
    Activity.find({ active: true, project: req.params.id })
        .populate('responsable')
        .populate('iteration')
        .then(activities => {
            let data = activities?.filter(a => a.iteration?.active && a.iteration?.started && !a.iteration?.finished);
            return res.status(200).send(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las actividades' });
        });
}

//Obtener actividades independientes
ActivityController.getBacklog = (req, res) => {
    Activity.find({ active: true, project: req.params.id, iteration: null, parent: null })
        .then((activities) => {
            return res.status(200).send(activities);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las actividades' });
        });
};

//Obtener Actividad
ActivityController.getActivity = (req, res) => {
    Activity.aggregate([
        { $match: { $and: [{ "_id": mongoose.Types.ObjectId(req.params.id) }, { active: true }] } },
        {
            $lookup: {
                from: "iterations",
                let: { "iteration": "$iteration" },
                pipeline: [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$iteration"] } } },
                ],
                as: "iteration"
            }
        },
        {
            $unwind: {
                path: "$iteration",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "projects",
                let: { "project": "$project" },
                pipeline: [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$project"] } } },
                ],
                as: "project"
            }
        },
        {
            $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                status: 1,
                resource: 1,
                priority: 1,
                start_date: 1,
                finish_date: 1,
                incidence: 1,
                iteration: {
                    _id: 1,
                    finished: 1,
                    start_date: 1,
                    finish_date: 1,
                    started: 1
                },
                project: {
                    _id: 1,
                    active: 1
                },
                responsable: 1,
                roles: 1,
                parent: 1,
                discard: 1,
                reason_discard: 1,
                tasks: {
                    $filter: {
                        input: "$tasks",
                        as: "task",
                        cond: {
                            $in: ["$$task.active", [true]]
                        }
                    }
                }
            }
        }
    ])
        .then((activity) => {
            return res.status(200).send(activity[0]);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver la actividad' });
        });
};

//Obtener historial de cambios de la actividad
ActivityController.getChangesByActivity = (req, res) => {
    Change.find({
        activity: req.params.id
    })
        .sort({ 'created_at': 'desc' })
        .populate('author')
        .then((changes) => {
            return res.status(200).send(changes);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver el historial de cambios' });
        });
};

//Obtener listado de subactividades por Actividad
ActivityController.getSubactivitiesByActivity = (req, res) => {
    Activity.find({
        $and: [
            { active: true },
            { incidence: false },
            { parent: req.params.id }
        ]
    })
        .then((subactivities) => {
            return res.status(200).send(subactivities);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las subactividades' });
        });
};

//Obtener listado de incidencias por Actividad
ActivityController.getIncidencesByActivity = (req, res) => {
    Activity.find({
        $and: [
            { active: true },
            { incidence: true },
            { parent: req.params.id }
        ]
    })
        .then((incidences) => {
            return res.status(200).send(incidences);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver las incidencias' });
        });
};

//Actualizar Actividad
ActivityController.updateActivity = (req, res) => {
    let match = {};
    let task = {};
    let deleteTask = false;
    match._id = req.params.id;
    if (req.body.tasks && req.body.tasks?.length > 0) {
        if (req.body.tasks[0].active === false) {
            deleteTask = true;
        }
        if (req.body.tasks[0]._id) {
            match.tasks = { $elemMatch: { _id: req.body.tasks[0]._id } }
        }
        task = req.body.tasks[0];
    }
    
    Activity.findOneAndUpdate(match,
        (req.body.tasks && req.body.tasks?.length > 0) ?
            (task._id) ?
                { $set: { "tasks.$.task": task.task, "tasks.$.active": task.active, "tasks.$.status": task.status } } :
                { $push: { tasks: task } } :
            { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró la actividad' });
            } else {
                if (!deleteTask) {
                    new Change({
                        ...req.body.change,
                        author: req.user.id
                    }).save()
                        .then((newChange) => {
                            return res.status(200).json(result);
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(500).send({ msg: 'Error al actualizar la actividad' });
                        });
                } else {
                    return res.status(200).json(result);
                }
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar la actividad' });
        });
};

//Dar de baja Actividad
ActivityController.deleteActivity = async (req, res) => {
    if (req.body.type === 'actividad') {
        Activity.findOneAndUpdate({ _id: req.params.id }, { active: false })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ msg: 'No se encontró la actividad' });
                } else {
                    Activity.updateMany({ parent: req.params.id }, { active: false })
                        .then(resultUpdate => {
                            if (!resultUpdate) {
                                return res.status(404).send({ msg: 'No se encontró la actividad' });
                            } else {
                                return res.status(200).send({ msg: 'Se ha dado de baja la actividad satisfactoriamente' });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(500).send({ msg: 'Error al dar de baja la actividad' });
                        });
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send({ msg: 'Error al dar de baja la actividad' });
            });
    } else {
        Activity.findOneAndUpdate({ _id: req.params.id }, { active: false })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ msg: 'No se encontró la actividad' });
                } else {
                    return res.status(200).send({ msg: 'Se ha dado de baja la actividad satisfactoriamente' })
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send({ msg: 'Error al dar de baja la actividad' });
            });
    }
};

//Descartar Actividad
ActivityController.discardActivity = async (req, res) => {
    Activity.findOneAndUpdate({ _id: req.params.id }, { discard: true, reason_discard: req.body.reason })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró la actividad' });
            } else {
                return res.status(200).send({ msg: 'Se ha descartado la actividad satisfactoriamente' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al descartar la actividad' });
        });
};

module.exports = ActivityController;

