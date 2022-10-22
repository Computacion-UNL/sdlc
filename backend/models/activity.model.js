'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var activitySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Por Hacer' },
    resource: { type: String },
    priority: { type: String, required: true },
    start_date: { type: Date },
    finish_date: { type: Date },
    finish_real_date: { type: Date },
    incidence: { type: Boolean, required: true },
    active: { type: Boolean, required: true, default: true },
    discard: { type: Boolean, default: false },
    reason_discard: { type: String },
    phase: { type: String },
    created_by_manager: { type: Boolean },
    tasks: [{
        task: { type: String },
        status: { type: String, default: "Incompleta" },
        active: { type: Boolean, default: true },
    }],
    iteration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Iteration",
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    responsable: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    roles: [{
        user: { type: String },
        role: { type: String },
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

activitySchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        description: joi.string(),
        status: joi.string().default('Por Hacer'),
        resource: joi.string(),
        priority: joi.string().required(),
        start_date: joi.date(),
        finish_date: joi.date(),
        finish_real_date: joi.date(),
        incidence: joi.boolean().required(),
        active: joi.boolean().default(true),
        discard: joi.boolean().default(false),
        reason_discard: joi.string(),
        phase: joi.string(),
        created_by_manager: joi.boolean(),
        tasks: joi.array().items(
            joi.object({
                task: joi.string(),
                status: joi.string().default("Incompleta"),
                active: joi.boolean().default(true)
            })
        ),
        iteration: joi.string(),
        project: joi.string().required(),
        responsable: joi.array(),
        roles: joi.array().items(
            joi.object({
                user: joi.string(),
                role: joi.string(),
            })
        ),
        parent: joi.string()
    });
    return schema.validate(obj);
}


module.exports = mongoose.model("Activity", activitySchema);
