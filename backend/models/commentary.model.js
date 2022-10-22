'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var commentarySchema = new Schema({
    description: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

commentarySchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        description: joi.string().required(),
        active: joi.boolean().default(true),
        author: joi.string().required(),
        activity: joi.string().required()
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("Commentary", commentarySchema);
