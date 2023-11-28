const mongoose = require('mongoose');

const LSPLocationSchema = new mongoose.Schema({
    city: String,
    state: String,
    country: String,
    // Other location-related fields if needed
});

const LSPEducationSchema = new mongoose.Schema({
    degree: String,
    college: String,
    // Other education-related fields if needed
});

const LSPSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    barID: {
        type: String,
        required: true
    },
    typeOfLSP: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    expertiseField: {
        type: String,
        required: true
    },
    practicingCourt: {
        type: String
        // You can set it as required if necessary
    },
    location: LSPLocationSchema,
    education: [LSPEducationSchema],
    // Other fields specific to LSP registration
}, { timestamps: true });

const LSPModel = mongoose.model('LSP', LSPSchema);

module.exports = LSPModel;
