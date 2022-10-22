'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var userSchema = new Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    pending: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.methods.joiValidate = (obj) => {
    const joi = require('joi');
    let schema = joi.object({
        name: joi.string().required(),
        lastname: joi.string().required(),
        email: joi.string().email().required().regex(/^[a-z0-9._%+-]+\@(unl.edu.ec)$/),
        password: joi.string().required(),
        image: joi.string(),
        pending: joi.boolean().default(false),
        admin: joi.boolean().default(false),
        active: joi.boolean().default(true),
    });
    return schema.validate(obj);
}

module.exports = mongoose.model("User", userSchema);
