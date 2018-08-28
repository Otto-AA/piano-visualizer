import mongoose from "mongoose";
import shortid from "shortid";
import { VisualizationDoc } from "./Visualization";
import { NoCastString } from "./modelUtils";

// TODO: This is untested. Remove me when this works



export type SongData = {
    name: string,
    userId: string,
    type: string,
    mp3Link: string,
    midLink: string,
    visualizations: [{
        visualizationType: string,
        visualization: string | mongoose.Types.ObjectId | VisualizationDoc
    }],
    externalSonglink?: string,
    pdfLink?: string,
};

export type SongDoc = mongoose.Document & SongData;

const songSchema = new mongoose.Schema({
    _id: {
        type: NoCastString,
        default: shortid.generate
    },
    name: {
        type: NoCastString,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: NoCastString,
        enum: ["composition", "improvisation", "cover"],
        required: true
    },
    externalSongLink: {
        type: NoCastString,
        required: false
    },
    mp3Link: {
        type: NoCastString,
        required: true
    },
    midLink: {
        type: NoCastString,
        required: true
    },
    pdfLink: {
        type: NoCastString,
        required: false
    },
    visualizations: {
        // TODO: Check if using an object instead of an array is possible here
        // TODO: Make it NoCastArray if possible
        type: [{
            visualizationType: {
                type: NoCastString,
                enum: ["standard"],
            },
            visualization: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Visualization"
            }
        }]
    }
}, { timestamps: true, strict: true });


const Song = mongoose.model("Song", songSchema);
export default Song;
