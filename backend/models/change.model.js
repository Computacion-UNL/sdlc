'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

var changeSchema = new Schema({
    attribute_type: { type: String, required: true },
    previous_value: { type: String, required: true },
    new_value: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model("Change", changeSchema);
