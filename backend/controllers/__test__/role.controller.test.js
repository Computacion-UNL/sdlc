'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const mongoose = require('../../database');
const Role = require('../../models/role.model');
const Project = require('../../models/project.model');
const app = require('../../index');

let token;
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

describe('Prueba Crear Rol', () => {
    it('Crear Rol Por Defecto', async () => {
        await Role.deleteMany({});
        await request(app)
            .post('/api/v1/role/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Gestor",
                permissions: [1],
                slug: 'manager'
            })
            .expect(200);
    }),
    it('Crear Proyecto para Rol Personalizado', async () => {
        await Project.deleteMany({});
        await request(app)
            .post('/api/v1/project/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Proyecto Rol Personalizado",
                description: "Descripcion proyecto con rol personalizado",
                repository: "https://github.com/example",
                general_objective: "Objetivo general del proyecto",
                specific_objectives: [
                    {name: "Objetivo específico 1"},
                    {name: "Objetivo específico 2"},
                ]
            })
            .then((response, err) => {
                project_id = response.body['project']._id;
            });
    }),
    it('Crear Rol Personalizado', async () => {
        await request(app)
            .post('/api/v1/role/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Rol Personalizado",
                permissions: [2,4],
                project: project_id,
            })
            .expect(200);
    }),
    it('Crear Rol con Datos Faltantes', async () => {
        await request(app)
            .post('/api/v1/role/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                permissions: [1,2],
                slug: "manager"
            })
            .expect(400);
    });
});
