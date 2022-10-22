'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var iterationSchema = new Schema({
    name: { type: String, required: true },
    start_date: { type: Date, required: true },
    finish_date: { type: Date, required: true },
    finished_at: { type: Date },
    objective: { type: String, required: true },
    score: { type: Number },
    active: { type: Boolean, required: true, default: true },
    started: { type: Boolean, default: false },
    finished: { type: Boolean, default: false },
    phase: { type: Number, default: 0 },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

iterationSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        start_date: joi.date().required(),
        finish_date: joi.date().required(),
        finished_at: joi.date(),
        objective: joi.string().required(),
        score: joi.number(),
        active: joi.boolean().default(true),
        started: joi.boolean().default(false),
        finished: joi.boolean().default(false),
        phase: joi.number().default(0),
        project: joi.string().required()
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("Iteration", iterationSchema);
