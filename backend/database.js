'use strict'

const mongoose = require('mongoose');
const User = require('./models/user.model');
const Role = require('./models/role.model');
const helper = require('./lib/helper');

if (process.env.NODE_ENV === 'test') {
    mongoose.connect(process.env.DB_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => {
            console.log('DB is connected');
        })
        .catch(err => console.log('Unable to connect to the database:', err));
} else {
    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => {
            console.log('DB is connected');
            //Crear usuario administrador por defecto
            User.find({})
                .then(users => {
                    if (users.length == 0) {
                        new User({
                            name: 'admin',
                            lastname: 'admin',
                            email: 'admin@unl.edu.ec',
                            password: helper.generateHash('admin_pass'),
                            admin: true,
                            verified: true,
                        }).save().then((newUser) => {
                            if (!newUser) {
                                console.log('Error al crear el usuario por defecto');
                            } else {
                                console.log('¡Administrador Creado!');
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            Role.find({})
                .then(async (roles) => {
                    if (roles.length == 0) {
                        Role.insertMany([
                            {
                                name: 'Gestor',
                                slug: 'manager',
                                permissions: [1]
                            },
                            {
                                name: 'Programador',
                                slug: 'collaborator',
                                permissions: [2, 3, 5, 6, 7, 8]
                            },
                            {
                                name: 'Auxiliar de Seguimiento',
                                slug: 'auxiliar',
                                permissions: [4]
                            }
                        ]).then(newRoles => {
                            if (!newRoles) {
                                console.log('Error al crear los roles por defecto');
                            } else {
                                console.log('¡Roles creados!');
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch(err => console.log('Unable to connect to the database:', err));
}
module.exports = mongoose;
