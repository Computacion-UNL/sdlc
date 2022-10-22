'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var attachmentSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String },
    active: { type: Boolean, default: true },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

attachmentSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        url: joi.string(),
        active: joi.boolean().default(true),
        activity: joi.string().required()
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("Attachment", attachmentSchema);
