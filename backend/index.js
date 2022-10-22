'use strict'
const express = require('express');
const morgan = require('morgan');
const errors = require('http-errors');
const path = require('path');
const cookie = require('cookie-parser');
const cors = require('cors');


require('dotenv').config();

const app = express();
const { mongoose } = require('./database');

//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie());
app.use(cors());

//Rutas
let xroute = process.env.NODE_ENV == ('development') || process.env.NODE_ENV == ('test') ? '':'/bsdlc';

app.use(xroute+'/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(xroute+'/api/v1', require('./routes/v1/auth.route'));
app.use(xroute+'/api/v1', require('./routes/v1/account.route'));
app.use(xroute+'/api/v1', require('./routes/v1/user.route'));
app.use(xroute+'/api/v1', require('./routes/v1/project.route'));
app.use(xroute+'/api/v1', require('./routes/v1/role.route'));
app.use(xroute+'/api/v1', require('./routes/v1/collaborator.route'));
app.use(xroute+'/api/v1', require('./routes/v1/iteration.route'));
app.use(xroute+'/api/v1', require('./routes/v1/activity.route'));
app.use(xroute+'/api/v1', require('./routes/v1/commentary.route'));
app.use(xroute+'/api/v1', require('./routes/v1/attachment.route'));
app.use(xroute+'/api/v1', require('./routes/v1/report.route'));
app.use(xroute+'/api/v1', require('./routes/v1/setting.route'));

app.use(function(req, res, next) {
    next(errors(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).send(err.message);
});

module.exports = app;
