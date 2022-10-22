'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const mongoose = require('../../database');
const app = require('../../index');

let token;
let project_id;
let activity_id;

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

describe('Prueba Crear Comentario', () => {
    it('Crear Proyecto', async () => {
        await request(app)
            .post('/api/v1/project/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Proyecto con Comentarios",
                description: "Descripción proyecto con comentarios",
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
    it('Crear Actividad', async() => {
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Actividad con comentarios",
            description: "Descripción de Actividad con comentarios",
            status: "En Curso",
            priority: "Media",
            start_date: new Date(),
            finish_date: new Date(),
            incidence: false,
            project: project_id,
            phase: "coding",
            created_by_manager: true
        })
        .then((response, err) => {
            activity_id = response.body['activity']._id;
        });
    }),
    it('Crear Comentario', async() => {
        await request(app)
        .post('/api/v1/commentary/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            description: "Descripción de Comentario",
            activity: activity_id,
        })
        .expect(200);
    }),
    it('Crear Comentario con Datos Faltantes', async() => {
        await request(app)
        .post('/api/v1/commentary/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            description: "Descripción de Comentario"
        })
        .expect(400);
    });
});
