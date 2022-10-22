'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const mongoose = require('../../database');
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

describe('Prueba Crear Iteración', () => {
    it('Crear Proyecto', async () => {
        await request(app)
            .post('/api/v1/project/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Proyecto con Iteraciones",
                description: "Descripción proyecto iteraciones",
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
    })
    it('Crear Iteración',async () => {
        await request(app)
        .post('/api/v1/iteration/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Iteración 1",
            start_date: new Date(),
            finish_date: new Date(),
            objective: "Objetivo de la Iteración 1",
            project: project_id
        })
        .expect(200);
    }),
    it('Crear Iteración con Datos Faltantes y Erróneos',async () => {
        await request(app)
        .post('/api/v1/iteration/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Iteración 1",
            start_date: new Date(),
            objective: "Objetivo de la Iteración 1",
            score: "Dato Erróneo",
            project: project_id
        })
        .expect(400);
    });
});
