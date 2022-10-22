'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var collaboratorSchema = new Schema({
    date_admission: { type: Date, required: true },
    owner: { type: Boolean, required: true, default: false },
    active: { type: Boolean, required: false, default: false },
    removed: { type: Boolean, default: false },
    reason: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

collaboratorSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        date_admission: joi.date().required(),
        owner: joi.boolean().default(false),
        active: joi.boolean().default(true),
        removed: joi.boolean().default(false),
        reason: joi.string(),
        user: joi.string().required(),
        project: joi.string().required(),
        role: joi.string().required()
    });
    return schema.validate(obj);
}


module.exports = mongoose.model("Collaborator", collaboratorSchema);
