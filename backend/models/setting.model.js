'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var settingSchema = new Schema({
    slug: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model("Setting", settingSchema);