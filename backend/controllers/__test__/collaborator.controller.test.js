'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const mongoose = require('../../database');
const Role = require('../../models/role.model');
const app = require('../../index');

let token;
let user_id;
let role;
let project_id;

beforeAll((done) => {
    request(app)
        .post('/api/v1/auth/signin')
        .send({
            email: "franz.flores@unl.edu.ec",
            password: "Prueba12345#"
        })
        .then((response, err) => {
            token = response.body.token;
            done();
        });
});

describe('Prueba Crear Colaborador', () => {
    it('Crear Usuario para Agregar a un Proyecto', async () => {
        await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: "César Alfonso",
                lastname: "Ortega Jaramillo",
                email: "cesar.ortega@unl.edu.ec",
                password: "Prueba12345#",
                admin: true,
                verified: true,
            })
            .then((response, err) => {
                user_id = response.body.user._id;
            });
    }),
        it('Crear Proyecto para Agregar Colaborador', async () => {
            await request(app)
                .post('/api/v1/project/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Proyecto para Agregar Rol",
                    description: "Descripcion proyecto para agregar rol",
                    repository: "https://github.com/example",
                    general_objective: "Objetivo general del proyecto",
                    specific_objectives: [
                        { name: "Objetivo específico 1" },
                        { name: "Objetivo específico 2" },
                    ]
                })
                .then((response, err) => {
                    project_id = response.body['project']._id;;
                });
        }),
        it('Agregar Colaborador', async () => {
            role = await Role.findOne({ slug: 'manager' });
            await request(app)
                .post('/api/v1/collaborator/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: user_id,
                    role: role._id,
                    project: project_id,
                })
                .expect(200);
        }),
        it('Agregar Colaborador con Información Faltante', async () => {
            await request(app)
                .post('/api/v1/collaborator/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user: user_id,
                    project: project_id,
                })
                .expect(400);
        });
});
