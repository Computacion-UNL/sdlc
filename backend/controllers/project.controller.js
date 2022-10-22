'use strict'

const fs = require('fs');
const path = require('path');
// const cloudinary = require('../lib/cloudinary');

const Project = require('../models/project.model');
const Role = require('../models/role.model');
const Collaborator = require('../models/collaborator.model');
const ProjectController = {};

//Crear Proyecto
ProjectController.createProject = (req, res) => {
    let project = new Project({ ...req.body });
    let validate = project.joiValidate({ ...req.body });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        project.save()
            .then(async (newProject) => {
                if (!newProject) {
                    return res.status(500).send({ msg: 'No se puedo registrar el proyecto' });
                } else {
                    const role = await Role.findOne({ slug: 'manager' });
                    new Collaborator({
                        date_admission: new Date(),
                        owner: true,
                        active: true,
                        user: req.user.id,
                        project: newProject._id,
                        role: role._id
                    }).save().then((newCollaborator) => {
                        if (!newCollaborator) {
                            return res.status(500).send({ msg: 'No se puedo registrar el proyecto' });
                        } else {
                            return res.status(200).send({ project: newProject });
                        }
                    }).catch(err => {
                        console.log('Error' + err);
                        return res.status(500).send({ msg: 'Error al registrar proyecto' });
                    });
                }
            }).catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al registrar proyecto' });
            });
    }
};

//Obtener listado de Proyectos del usuario
ProjectController.getProjectsByUser = (req, res) => {
    Collaborator.find({ user: req.user.id, removed: false, active: true })
        .select('collaborator.project')
        .populate('project')
        .exec()
        .then((projects) => {
            let data = projects?.map(x => x.project).filter(y => y.status === req.body.status);
            return res.status(200).send(data);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Ha ocurrido un error en la consulta.' });
        });
};

//Buscar proyectos de Usuario
ProjectController.searchProjectsByUser = (req, res) => {
    Collaborator.find({ user: req.user.id, removed: false })
        .select('collaborator.project')
        .populate('project')
        .then((projects) => {
            let search = req.body.search?.toLowerCase();
            let data = projects?.filter(x => x.project.name?.toLowerCase().trim().includes(search) && x.project.active === true);
            return res.status(200).send(data);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Ha ocurrido un error en la consulta.' });
        });
};

//Obtener Proyecto
ProjectController.getProject = (req, res) => {
    Project.findOne({ _id: req.params.id })
        .then((project) => {
            return res.status(200).send(project);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver proyecto' });
        });
};

//Actualizar Datos de Proyecto
ProjectController.updateProject = (req, res) => {
    Project.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el proyecto' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado la información del proyecto con éxito' })
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el proyecto' });
        });
};

//Dar de baja Proyecto
ProjectController.deleteProject = (req, res) => {
    Project.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el proyecto' });
            } else {
                return res.status(200).send({ msg: 'Se ha dado de baja el proyecto con éxito' })
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al dar de baja el proyecto' });
        });
};

//Subir imagen de Proyecto
ProjectController.uploadImage = async (req, res) => {
    if (req.files) {
        // const result = await cloudinary.cloudinaryUpload(req.files.image.path);
        // let fileExt = result.format;
       let filePath = req.files.image.path;
       let fileSplit = (process.platform == 'linux') ?  filePath.split('\\') : filePath.split('\/');
       let fileName = fileSplit[fileSplit.length - 1];
       let extSplit = fileName.split('\.');
       var fileExt = extSplit[1];

        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpge' || fileExt == 'JPG') {
            Project.findOneAndUpdate({ _id: req.params.id }, { image: fileName }, { new: true })
                .then(projectUpdate => {
                    if (!projectUpdate) {
                        return res.status(404).send({ msg: 'No se encontró el proyecto' });
                    } else {
                        return res.status(200).json(projectUpdate);
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).send({ msg: 'Error al subir imagen' });
                });
        } else {
            fs.unlink(filePath, (err) => {
                console.log(err);
                return res.status(400).send({ msg: 'La extensión no es válida' });
            });
        }
    }
};

ProjectController.deleteImage = (req,res) => {
    Project.updateOne({_id: req.params.id}, {image: null})
        .then(projectUpdate => {
            if (!projectUpdate) {
                return res.status(404).send({ msg: 'No se pudo encontrar el proyecto' });
            } else {
                return res.status(200).json({ msg: 'Se ha eliminado la imagen correctamente' });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar la imagen' });
        });
}

//Obtener imagen de proyecto
ProjectController.getImageFile = (req, res) => {
    let path_file = './uploads/projects/' + req.params.imageFile;
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

module.exports = ProjectController;

