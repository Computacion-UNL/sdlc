'use strict'

const User = require('../models/user.model');
const UserController = {};

//Obtener Usuarios
UserController.getUsers = (req, res) => {
    User.find()
        .then((users) => {
            return res.status(200).send(users);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver usuarios' });
        });
};

//Obtener Usuario
UserController.getUser = (req, res) => {
    User.find({ _id: req.params.id })
        .then((user) => {
            return res.status(200).send(user);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al devolver usuario' });
        });
};

//Actualizar estado (activo,dado de baja)
UserController.updateStatus = (req, res) => {
    User.findOneAndUpdate({ _id: req.params.id }, { active: req.body.active })
        .then(user => {
            if (!user) {
                return res.status(404).send({ msg: "No se encontró la cuenta" });
            } else {
                if (user.active != false) {
                    return res.status(200).send({ msg: 'Se elimino el usuario con éxito' });
                } else {
                    return res.status(200).send({ msg: 'Se restauró el usuario con éxito' });
                }
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({ msg: 'Error al actualizar el usuario' });
        });
};

//Buscar Usuario
UserController.searchUser = (req, res) => {
    User.find({
        $or: [{ name: { $regex: new RegExp(req.body.search, "i") } },
        { lastname: { $regex: new RegExp(req.body.search, "i") } },
        { email: { $regex: new RegExp(req.body.search, "i") } }
        ]
    }).then((users) => {
        return res.status(200).send(users);
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({ msg: 'Error al devolver usuarios' });
    });
};

module.exports = UserController;
