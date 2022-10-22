'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var roleSchema = new Schema({
    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    slug: { type: String },
    permissions: [{ type: Number, required: true }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

roleSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        slug: joi.string(),
        active: joi.boolean().default(true),
        permissions: joi.array(),
        project: joi.string()
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("Role", roleSchema);
