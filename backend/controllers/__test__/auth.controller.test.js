'use strict'

const request = require('supertest');
const babel = require('babel-polyfill');
require('dotenv').config();

const app = require('../../index');
const mongoose = require('../../database');
const User = require('../../models/user.model');
const Collaborator = require('../../models/collaborator.model');

beforeAll(async () => {
    await User.deleteMany({});
    await Collaborator.deleteMany({});
});

describe('Prueba Crear Usuario', () => {
    it('Crear Usuario con Información Correcta', async () => {
        await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: "Franz Andrés",
                lastname: "Flores Gallardo",
                email: "franz.flores@unl.edu.ec",
                password: "Prueba12345#",
                admin: true,
                verified: true,
            })
            .expect(200)
    }),
    it('Crear Usuario con Correo Incorrecto', async () => {
        await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: "Franz",
                lastname: "Flores",
                email: "andresfloresgallardo@gmail.com",
                password: "Prueba12345#",
                admin: true
            })
            .expect(400)
    }),
    it('Crear Usuario con Datos Incompletos', async () => {
        await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: "Franz",
                password: "prueba",
                admin: true
            })
            .expect(400)
    });

});


