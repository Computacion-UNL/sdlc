'use strict'
const { transporter, invitation_template } = require('../lib/mailer');
const Collaborator = require('../models/collaborator.model');
const Project = require('../models/project.model');
const CollaboratorController = {};

//Agregar Colaborador al Proyecto
CollaboratorController.addCollaboratorToProject = async (req, res) => {
    const found = await Collaborator.findOne({
        user: req.body.user,
        project: req.body.project,
        removed: false
    });

    if (!found) {
        let collaborator = new Collaborator({ date_admission: new Date(), ...req.body });
        let validate = collaborator.joiValidate({ date_admission: new Date(), user: req.body.user, project: req.body.project, role: req.body.role, removed: false });

        if (validate.error) {
            console.log(validate.error)
            return res.status(400).send(validate.error.details);
        } else {
            collaborator.save()
                .then(async (newCollaborator) => {
                    if (!newCollaborator) {
                        return res.status(500).send({ msg: 'No se pudo agregar el colaborador al proyecto' });
                    } else {
                        const project = await Project.findOne({ _id: req.body.project }, 'name');

                        if (process.env.NODE_ENV === 'production') {
                            const { transport, sender, user } = await transporter();
                            console.log('hi2');
                            transport.sendMail({
                                from: '"' + sender + '" <' + user + '>',
                                to: req.body.email,
                                subject: "Invitación a proyecto",
                                html: invitation_template(project.name, `${process.env.FRONTEND_URL}/invitation/${newCollaborator._id}`)
                            }, async (err, info) => {
                                if (err) {
                                    console.log("ERROR: ", err);
                                    await Collaborator.deleteOne({ _id: newCollaborator._id });
                                    return res.status(500).send({ msg: 'Ha ocurrido un error al intentar enviar el correo.' });
                                }
                                console.log("INFO: ", info);
                                return res.status(200).send({ collaborator: newCollaborator });
                            });
                        } else {
                            return res.status(200).send({ collaborator: newCollaborator });
                        }
                    }
                })
                .catch(err => {
                    console.log('Error' + err);
                    return res.status(500).send({ msg: 'Error al agregar colaborador al proyecto' });
                });
        }
    } else {
        return res.status(400).send({ msg: 'El usuario ya se encuentra en el proyecto.' });
    }
};

//Obtener listado de colaboradores de proyecto
CollaboratorController.getCollaborators = (req, res) => {
    Collaborator.find({ project: req.params.id_project, removed: false })
        .populate('user')
        .populate('role')
        .sort('created_at')
        .then((collaborators) => {
            return res.status(200).send(collaborators);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver colaboradores de proyecto' });
        });
};

CollaboratorController.getCollaboratorByProject = (req, res) => {
    Collaborator.findOne({ user: req.params.id_user, project: req.params.id_project, removed: false })
        .populate('user')
        .populate('role')
        .then((collaborator) => {
            return res.status(200).send(collaborator);
        }).catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver colaborador de proyecto' });
        });
};

//Obtener lsitado de proyectos donde el usuario es Gestor
CollaboratorController.getProyectsByCollaborator = (req, res) => {
    Collaborator.find({ user: req.params.id_user, removed: false })
        .populate('project')
        .populate('role')
        .sort('created_at')
        .then((result) => {
            let projects = [];
            result.forEach(element => {
                if (element.role.name === "Gestor") {
                    projects.push(element.project);
                }
            });
            return res.status(200).send(projects);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver colaboradores de proyecto' });
        });
}

CollaboratorController.searchProyectsByCollaborator = (req, res) => {
    Collaborator.find({ user: req.params.id_user, removed: false })
        .populate('project')
        .populate('role')
        .sort('created_at')
        .then((result) => {
            let projects = [];
            let search = req.body.search?.toLowerCase();
            result.forEach(element => {
                if (element.role.name === "Encargado de Seguimiento" && element.project.name.toLowerCase().trim().includes(search) && element.project.active === true) {
                    projects.push(element.project);
                }
            });
            return res.status(200).send(projects);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver colaboradores de proyecto' });
        });
}

// Obtener colaborador para invitación
CollaboratorController.getCollaborator = (req, res) => {
    Collaborator.findOne({ _id: req.params.id, active: false, removed: false })
        .populate('role')
        .populate('project')
        .then(colab => {
            return res.status(200).send(colab);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al obtener invitación' });
        });
};

//Actualizar Datos de Colaborador
CollaboratorController.updateCollaborator = (req, res) => {
    Collaborator.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el colaborador a actualizar' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado la información del colaborador con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar la informacion el colaborador' });
        });
};

//Eliminar colaborador
CollaboratorController.deleteCollaborator = (req, res) => {
    Collaborator.findOneAndUpdate({ _id: req.params.id }, { removed: true })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró al colaborador a dar de baja' });
            } else {
                return res.status(200).send({ msg: 'Se ha eliminado el colaborador con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar el colaborador' });
        });
};

module.exports = CollaboratorController;

