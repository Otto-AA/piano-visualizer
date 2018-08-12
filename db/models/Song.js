const mongoose = require('mongoose');
const { databaseLogger } = require('../../config/logger');
const shortid = require('shortid');


const songSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    name: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['composition', 'improvisation', 'cover']
    },
    externalSongLink: {
        type: String,
        required: false
    },
    mp3Link: {
        type: String,
        required: true
    },
    midLink: {
        type: String,
        required: true
    },
    pdfLink: {
        type: String,
        required: false,
        default: false
    },
    visualizations: {
        // TODO: Check if using an object instead of an array is possible here
        type: [{
            visualizationType: {
                type: String,
                enum: ['standard']
            },
            visualizationId: {
                type: mongoose.Schema.Types.ObjectId,
                // Dynamic link to collection with the previously specified type
                ref: 'visualizations.visualizationType'
            }
        }],
        required: true
    }
}, {
        timestamps: true,
        strict: 'throw'
    });


const Song = mongoose.model('Song', songSchema);

module.exports = Song;
