'use strict'

const Role = require('../models/role.model');
const RoleController = {};

//Crear Rol
RoleController.createRole = (req, res) => {
    let role = new Role({ ...req.body });
    let validate = role.joiValidate({ ...req.body });
    if (validate.error) {
        return res.status(400).send(validate.error.details);
    } else {
        role.save()
            .then((newRole) => {
                if (!newRole) {
                    return res.status(500).send({ msg: 'No se puedo registrar el rol' });
                } else {
                    return res.status(200).send({ role: newRole });
                }
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al registrar rol' });
            });
    }
};

//Obtener listado de roles por proyecto
RoleController.getRolesByProject = (req, res) => {
    Role.find({
        $and: [
            { active: true },
            { $or: [{ project: req.params.id_project }, { project: null },] }
        ]
    })
        .then((roles) => {
            return res.status(200).send(roles);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver roles' });
        });
};

//Actualizar Rol
RoleController.updateRole = (req, res) => {
    Role.findOneAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el proyecto' });
            } else {
                return res.status(200).send({ msg: 'Se ha actualizado la información del rol con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el rol' });
        });
};

//Dar de baja Rol
RoleController.deleteRole = (req, res) => {
    Role.findOneAndUpdate({ _id: req.params.id }, { active: false })
        .then(result => {
            if (!result) {
                return res.status(404).send({ msg: 'No se encontró el rol' });
            } else {
                return res.status(200).send({ msg: 'Se ha eliminado el rol con éxito' })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al eliminar el rol' });
        });
};

module.exports = RoleController;

