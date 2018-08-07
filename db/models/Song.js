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
        type: mongoose.Schema.Types.ObjectId,
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
        type: [{
            visualization_type: {
                type: String,
                enum: ['VisualizationStandard']
            },
            visualization_id: {
                type: mongoose.Schema.Types.ObjectId,
                // Dynamic link to collection with the previously specified type
                ref: 'visualizations.visualization_type'
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
