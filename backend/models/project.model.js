'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var projectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "En ejecución" },
    active: { type: Boolean, default: true },
    reason: { type: String },
    image: { type: String },
    repository: { type: String },
    iteration: { type: String },
    general_objective: { type: String },
    specific_objectives: [
        {
            name: { type: String },
            done: { type: Boolean, default: false },
        }
    ],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

projectSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        description: joi.string().allow(''),
        status: joi.string().default("En ejecución"),
        active: joi.boolean().default(true),
        reason: joi.string(),
        image: joi.string(),
        repository: joi.string(),
        iteration: joi.string(),
        general_objective: joi.string().allow(''),
        specific_objectives: joi.array().items(joi.object({
            name: joi.string().allow(''),
            done: joi.boolean().default(false),
        })),
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("Project", projectSchema);
