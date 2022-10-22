'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const mongoose = require('../../database');
const Activity = require('../../models/activity.model');
const app = require('../../index');

let token;
let project_id;
let iteration_id;
let activity_id;
let activity;

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

describe('Prueba Crear Actividades, Subactividades e Iteraciones', () => {
    it('Crear Proyecto', async () => {
        await request(app)
            .post('/api/v1/project/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Proyecto con Actividades, Subactividades e Incidencias",
                description: "Descripción proyecto de Actividades, Subactividades e Incidencias",
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
    it('Crear Iteración',async () => {
        await request(app)
        .post('/api/v1/iteration/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Iteración con Actividades",
            start_date: new Date(),
            finish_date: new Date(),
            objective: "Objetivo de la Iteración con Actividades",
            project: project_id
        })
        .then((response, err) => {
            iteration_id = response.body['iteration']._id;
        });
    }),
    it('Crear Actividad en Iteración',async () => {
        await Activity.deleteMany({});
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Actividad dentro de Iteración",
            description: "Descripción de Actividad",
            status: "En Curso",
            priority: "Media",
            start_date: new Date(),
            finish_date: new Date(),
            incidence: false,
            iteration: iteration_id,
            project: project_id,
            phase: "coding",
            created_by_manager: true
        })
        .then((response, err) => {
            activity_id = response.body['activity']._id;
        });
    }),
    it('Crear Actividad en Reserva',async () => {
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Actividad en Reserva",
            status: "En Curso",
            priority: "Media",
            start_date: new Date(),
            finish_date: new Date(),
            incidence: false,
            project: project_id,
        })
        .expect(200);
    }),
    it('Crear Subactividad',async () => {
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Subactividad",
            status: "En Curso",
            priority: "Media",
            start_date: new Date(),
            finish_date: new Date(),
            incidence: false,
            parent: activity_id,
            project: project_id,
        })
        .expect(200);
    }),
    it('Crear Incidencia',async () => {
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Incidencia",
            status: "En Curso",
            priority: "Media",
            start_date: new Date(),
            finish_date: new Date(),
            incidence: true,
            parent: activity_id,
            project: project_id,
        })
        .expect(200);
    }),
    it('Registrar Cambio para Historial de Actividad',async () => {
        activity = await Activity.findOne({_id: activity_id}).select("description");
        await request(app)
        .put(`/api/v1/activity/update/${activity_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            description: "Descripción a Actividad Modificada",
            change: {
                attribute_type: "Descripción",
                previous_value: activity.description,
                new_value: "Descripción a Actividad Modificada",
                activity: activity_id
            }
        })
        .expect(200);
    }),
    it('Crear Actividad con Información Faltante',async () => {
        await request(app)
        .post('/api/v1/activity/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Actividad",
            status: true,
            priority: "Media",
            start_date: "2021",
            finish_date: new Date(),
        })
        .expect(400);
    });
});
