'use strict'

const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Project = require('../models/project.model');
const Iteration = require('../models/iteration.model');
const template = fs.readFileSync(require.resolve('../lib/report.html'), 'utf-8');
const helpers = require('../lib/helper');
const ReportController = {};

let config = {
    "format": "A4",
    "border": {
        "top": "5.5mm",
        "right": "3mm",
        "bottom": "5.5mm",
        "left": "3mm"
    },
}
let html = "";


//Generar Reporte en PDF
ReportController.generateReport = (req, res) => {
    Project.aggregate([
        { $match: { "_id": mongoose.Types.ObjectId(req.params.id) } },
        {
            $lookup: {
                from: "activities",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "iteration": null }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "users",
                            let: { "responsable": "$responsable" },
                            pipeline: [
                                { "$match": { "$expr": { "$in": ["$_id", "$$responsable"] } } },
                            ],
                            as: "responsables"
                        }
                    }
                ],
                as: "activities_only"
            }
        },
        {
            $unwind: {
                path: "$activities_only",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "iterations",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "activities",
                            let: { "iteration": "$_id" },
                            pipeline: [
                                { "$match": { "$and": [{ "$expr": { "$eq": ["$iteration", "$$iteration"] } }, { "active": true }, { "parent": null }] } },
                                {
                                    $lookup: {
                                        from: "users",
                                        let: { "responsable": "$responsable" },
                                        pipeline: [
                                            { "$match": { "$expr": { "$in": ["$_id", "$$responsable"] } } },
                                        ],
                                        as: "responsables"
                                    }
                                }
                            ],
                            as: "activities"
                        },
                    },
                ],
                as: "iterations"
            }
        },
        {
            $unwind: {
                path: "$iterations",
                preserveNullAndEmptyArrays: true
            }
        },
        { $sort: { "iterations.start_date": -1 } },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                iterations: { $addToSet: "$iterations" },
                activities_only: { $addToSet: "$activities_only" }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                iterations: {
                    _id: 1,
                    name: 1,
                    finish_date: 1,
                    score: 1,
                    activities: {
                        _id: 1,
                        name: 1,
                        status: 1,
                        finish_date: 1,
                        responsables: {
                            name: 1,
                            lastname: 1,
                            email: 1
                        }
                    }
                },
                activities_only: {
                    _id: 1,
                    name: 1,
                    status: 1,
                    finish_date: 1,
                    responsables: {
                        name: 1,
                        lastname: 1,
                        email: 1
                    }
                }
            }
        }
    ])
        .then(result => {
            let string = JSON.stringify(result[0]);
            let project = JSON.parse(string);
            html = template.replace('{{date}}', helpers.formatDate(new Date()));
            html = html.replace('{{project.name}}', project.name);
            html = html.replace('{{user.name}}', req.user.name + " " + req.user.lastname);
            html = html.replace('{{document-name}}', 'Informe del Estado del Proyecto');
            html = html.replace('{{hide}}', '');

            if (project.iterations.length > 0) {
                for (const iteration of project.iterations) {
                    let score = (iteration.score) ? iteration.score : "No existe calificación asignada";
                    html += `<table>
                    <tr>
                        <td class="iteration-name"><b>Iteración:</b> ` + iteration.name + `</td>
                        <td class="iteration-date"><b>Finaliza en:</b>` + helpers.formatDate(new Date(iteration.finish_date)) + `</td>
                    </tr>
                    </table>`;
                    if (iteration.activities.length > 0) {
                        html += `<table class="data-table">
                        <thead class="header">
                            <th class="data-cell">ACTIVIDAD</th>
                            <th class="data-cell">ESTADO</th>
                            <th class="data-cell">FECHA DE VENCIMIENTO</th>
                            <th class="data-cell">COLABORADOR(ES)</th>
                        </thead>
                        <tbody>`;
                        for (const activity of iteration.activities) {
                            html += `
                            <tr>
                                <td class="data-cell">`+ activity.name + `</td>
                                <td class="data-cell">`+ activity.status + `</td>
                                <td class="data-cell">`+ helpers.formatDate(new Date(activity.finish_date)) + `</td>
                                <td class="data-cell"><ul>`;
                            if (activity.responsables.length > 0) {
                                for (const responsable of activity.responsables) {
                                    html += `<li>` + responsable.name + ` ` + responsable.lastname + `</li>`;
                                }
                            } else {
                                html += `<li>No Asignado</li>`;
                            }
                            html += `</ul></td></tr>`;
                        }
                        html += `</tbody></table>`;
                    } else {
                        html += `<table>
                        <tr>
                            <td class="messages">No existen actividades para esta iteración</td>
                        <tr>
                        </table>`;
                    }
                }
            } else {
                html += `<table>
                <tr>
                    <td class="messages">No existen iteraciones planificadas dentro del proyecto</td>
                <tr>
                </table>`;
            }


            //Actividades independientes
            html += `<table>
            <tr>
                <td class="subtitle">ACTIVIDADES INDEPENDIENTES</td>
            </tr>
            </table>`;
            if (project.activities_only.length > 0) {
                html += `<table class="data-table">
                <thead class="header">
                    <th class="data-cell">ACTIVIDAD</th>
                    <th class="data-cell">ESTADO</th>
                    <th class="data-cell">FECHA DE VENCIMIENTO</th>
                    <th class="data-cell">COLABORADOR(ES)</th>
                </thead>
                <tbody>`;
                for (const activity of project.activities_only) {
                    html += `
                    <tr>
                        <td class="data-cell">`+ activity.name + `</td>
                        <td class="data-cell">`+ activity.status + `</td>
                        <td class="data-cell">`+ helpers.formatDate(new Date(activity.finish_date)) + `</td>
                        <td class="data-cell"><ul>`;
                    if (activity.responsables.length > 0) {
                        for (const responsable of activity.responsables) {
                            html += `<li>` + responsable.name + ` ` + responsable.lastname + `</li>`;
                        }
                    } else {
                        html += `<li>No Asignado</li>`;
                    }
                    html += `</ul></td></tr>`;
                }
                html += `</tbody></table>`;
            } else {
                html += `<table>
                <tr>
                    <td class="messages">No existen actividades independientes dentro del proyecto</td>
                <tr>
                </table>`;
            }
            pdf.create(html, config).toFile('./reports/reporte.pdf', (err, response) => {
                if (response) {
                    const path_file = response.filename;
                    fs.stat(path_file, (error) => {
                        if (!error) {
                            return res.sendFile(path.resolve(path_file));
                        } else {
                            return res.status(204).send({
                                msg: 'No se pudo generar el reporte'
                            });
                        }
                    });
                } else {
                    console.log(err);
                    return res.status(500).send({ msg: 'Error al generar reporte' });
                }
            });
        })
        .catch(err => {
            console.log('Error' + err);
            return res.status(500).send({ msg: 'Error al generar reporte' });
        });
};

ReportController.getInformationForReport = (req, res) => {
    Project.aggregate([
        { $match: { "_id": mongoose.Types.ObjectId(req.params.id) } },
        {
            $lookup: {
                from: "activities",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "iteration": null }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "users",
                            let: { "responsable": "$responsable" },
                            pipeline: [
                                { "$match": { "$expr": { "$in": ["$_id", "$$responsable"] } } },
                            ],
                            as: "responsables"
                        }
                    }
                ],
                as: "activities_only"
            }
        },
        {
            $unwind: {
                path: "$activities_only",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "iterations",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "activities",
                            let: { "iteration": "$_id" },
                            pipeline: [
                                { "$match": { "$and": [{ "$expr": { "$eq": ["$iteration", "$$iteration"] } }, { "active": true }, { "parent": null }] } },
                                {
                                    $lookup: {
                                        from: "users",
                                        let: { "responsable": "$responsable" },
                                        pipeline: [
                                            { "$match": { "$expr": { "$in": ["$_id", "$$responsable"] } } },
                                        ],
                                        as: "responsables"
                                    }
                                }
                            ],
                            as: "activities"
                        },
                    },
                ],
                as: "iterations"
            }
        },
        {
            $unwind: {
                path: "$iterations",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "collaborators",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "users",
                            let: { "user": "$user" },
                            pipeline: [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$user"] } } },
                                {
                                    "$project": {
                                        "_id": 1,
                                        "name": 1,
                                        "lastname": 1
                                    }
                                }
                            ],
                            as: "user"
                        },
                    },
                    {
                        $lookup: {
                            from: "roles",
                            let: { "role": "$role" },
                            pipeline: [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$role"] } } },
                                {
                                    "$project": {
                                        "_id": 1,
                                        "name": 1,
                                    }
                                }
                            ],
                            as: "role"
                        },
                    },
                ],
                as: "collaborators"
            },
        },
        {
            $unwind: {
                path: "$collaborators",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                iterations: { $addToSet: "$iterations" },
                activities_only: { $addToSet: "$activities_only" },
                collaborators: { $addToSet: "$collaborators" }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                iterations: {
                    _id: 1,
                    name: 1,
                    start_date: 1,
                    finish_date: 1,
                    objective: 1,
                    score: 1,
                    created_at: 1,
                    activities: {
                        _id: 1,
                        name: 1,
                        status: 1,
                        finish_date: 1,
                        created_at: 1,
                        responsables: {
                            name: 1,
                            lastname: 1,
                            email: 1
                        }
                    }
                },
                activities_only: {
                    _id: 1,
                    name: 1,
                    status: 1,
                    finish_date: 1,
                    responsables: {
                        name: 1,
                        lastname: 1,
                        email: 1
                    }
                },
                collaborators: {
                    user: 1,
                    role: 1
                }
            }
        },
    ])
        .then(result => {
            res.status(200).send(result);
        })
        .catch(err => {
            console.log('Error' + err);
            return res.status(500).send({ msg: 'Error al obtener información del reporte' });
        });
};

ReportController.generateIterationReport = (req, res) => {
    Iteration.aggregate([
        { $match: { "_id": mongoose.Types.ObjectId(req.params.id) } },
        {
            $lookup: {
                from: "activities",
                let: { "iteration": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$iteration", "$$iteration"] } }, { "active": true }, {"parent": null}] } },
                    {
                        $lookup: {
                            from: "users",
                            let: { "responsable": "$responsable" },
                            pipeline: [
                                { "$match": { "$expr": { "$in": ["$_id", "$$responsable"] } } },
                            ],
                            as: "responsables"
                        }
                    }
                ],
                as: "activities"
            }
        },
        {
            $unwind: {
                path: "$activities",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "collaborators",
                let: { "project": "$_id" },
                pipeline: [
                    { "$match": { "$and": [{ "$expr": { "$eq": ["$project", "$$project"] } }, { "active": true }] } },
                    {
                        $lookup: {
                            from: "users",
                            let: { "user": "$user" },
                            pipeline: [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$user"] } } },
                                {
                                    "$project": {
                                        "_id": 1,
                                        "name": 1,
                                        "lastname": 1
                                    }
                                }
                            ],
                            as: "user"
                        },
                    },
                    {
                        $lookup: {
                            from: "roles",
                            let: { "role": "$role" },
                            pipeline: [
                                { "$match": { "$expr": { "$eq": ["$_id", "$$role"] } } },
                                {
                                    "$project": {
                                        "_id": 1,
                                        "name": 1,
                                    }
                                }
                            ],
                            as: "role"
                        },
                    },
                ],
                as: "collaborators"
            },
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                start_date: { $first: "$start_date" },
                finish_date: { $first: "$finish_date" },
                project: { $first: "$project" },
                score: { $first: "$score" },
                activities: { $addToSet: "$activities" },
                collaborators: { $addToSet: "$collaborators" }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                start_date: 1,
                finish_date: 1,
                score: 1,
                project: 1,
                activities: {
                    _id: 1,
                    name: 1,
                    status: 1,
                    finish_date: 1,
                    discard: 1,
                    responsables: {
                        name: 1,
                        lastname: 1,
                        email: 1
                    }

                }
            }
        }
    ]).then(result => {
        Iteration.populate(result, { path: "project" })
            .then(resp => {
                let string = JSON.stringify(resp[0]);
                let iteration = JSON.parse(string);

                html = template.replace('{{date}}', helpers.formatDate(new Date()));
                html = html.replace('{{project.name}}', iteration.project.name);
                html = html.replace('{{user.name}}', req.user.name + " " + req.user.lastname);
                html = html.replace('{{document-name}}', `Resumen de la iteración ${iteration.name}`);
                html = html.replace('{{hide}}', 'hide');
                
                html += `<table>
                <tr>
                    <td class="iteration-date-report"><b>Fecha de Inicio:</b>` + helpers.formatDate(new Date(iteration.start_date)) + `</td>
                    <td class="iteration-date-report"><b>Fecha de Finalización:</b>` + helpers.formatDate(new Date(iteration.finish_date)) + `</td>
                </tr>
                </table>`;
                if (iteration.activities.length > 0) {
                    html += `<table class="data-table">
                    <thead class="header">
                        <th class="data-cell">ACTIVIDAD</th>
                        <th class="data-cell">ESTADO</th>
                        <th class="data-cell">FECHA DE VENCIMIENTO</th>
                        <th class="data-cell">COLABORADOR(ES)</th>
                    </thead>
                    <tbody>`;
                    for (const activity of iteration.activities) {
                        let status = (activity.discard === true) ? "Descartada" : activity.status;
                        html += `
                        <tr>
                            <td class="data-cell">`+ activity.name + `</td>
                            <td class="data-cell">`+  status + `</td>
                            <td class="data-cell">`+ helpers.formatDate(new Date(activity.finish_date)) + `</td>
                            <td class="data-cell"><ul>`;
                        if (activity.responsables.length > 0) {
                            for (const responsable of activity.responsables) {
                                html += `<li>` + responsable.name + ` ` + responsable.lastname + `</li>`;
                            }
                        } else {
                            html += `<li>No Asignado</li>`;
                        }
                        html += `</ul></td></tr>`;
                    }
                    html += `</tbody></table>`;
                } else {
                    html += `<table>
                    <tr>
                        <td class="messages">No existen actividades para esta iteración</td>
                    <tr>
                    </table>`;
                }
                pdf.create(html, config).toFile('./reports/reporte.pdf', (err, response) => {
                    if (response) {
                        const path_file = response.filename;
                        fs.stat(path_file, (error) => {
                            if (!error) {
                                return res.sendFile(path.resolve(path_file));
                            } else {
                                return res.status(204).send({
                                    msg: 'No se pudo generar el reporte'
                                });
                            }
                        });
                    } else {
                        console.log(err);
                        return res.status(500).send({ msg: 'Error al generar reporte' });
                    }
                });
            })
            .catch(err => {
                console.log('Error' + err);
                return res.status(500).send({ msg: 'Error al generar reporte' });
            });
    });
}

module.exports = ReportController;
