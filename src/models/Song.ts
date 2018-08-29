import mongoose from "mongoose";
import shortid from "shortid";
import { NoCastString } from "./modelUtils";
import Visualization from "./visualizations/standard";

Visualization;

export type SongData = {
    name: string,
    userId: string,
    type: string,
    mp3Link: string,
    midLink: string,
    visualizations: [{
        kind: string,
        item: string | { [k: string]: any }
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
    // TODO: Make it NoCastArray if possible
    visualizations: [{
        kind: {
            type: NoCastString,
            enum: ["standard"],
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "visualizations.kind"
        }
    }]
}, { timestamps: true, strict: true });


const Song = mongoose.model("Song", songSchema);
export default Song;
