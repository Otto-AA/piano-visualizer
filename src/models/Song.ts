import mongoose from "mongoose";
import shortid from "shortid";
import { VisualizationModel } from "./Visualization";
import { ValidationSchema } from "express-validator/check";

// TODO: This is untested. Remove me when this works



export type SongData = {
    name: string,
    userId: string | mongoose.Types.ObjectId,
    type: string,
    mp3Link: string,
    midLink: string,
    visualizations: [{
        visualizationType: string,
        visualization: string | mongoose.Types.ObjectId | VisualizationModel
    }],
    externalSonglink?: string,
    pdfLink?: string,
};

export type SongModel = mongoose.Document & SongData;

const songSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    name: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["composition", "improvisation", "cover"],
        required: true
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
        required: false
    },
    visualizations: {
        // TODO: Check if using an object instead of an array is possible here
        type: [{
            visualizationType: {
                type: String,
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


const songSchemaValidator: ValidationSchema = {};
songSchemaValidator.name = {
    in: ["body", "query"],
    isLength: {
        errorMessage: "name should be at least 1 chars long",
        options: [{ min: 1 }]
    },
    isAlphanumeric: {
        errorMessage: "name may only contain letters and numbers"
    }
};

songSchemaValidator.type = {
    in: ["body", "query"],
    custom: {
        errorMessage: "type must be: composition, improvisation or cover",
        options: [(type: string) => ["composition", "improvisation", "cover"].indexOf(type) > -1]
    }
};

songSchemaValidator.mp3Link = {
    in: ["body", "query"],
    isURL: {
        errorMessage: "Must be a URL"
    }
};

songSchemaValidator.midLink = {
    in: ["body", "query"],
    isURL: {
        errorMessage: "Must be a URL"
    }
};

songSchemaValidator.pdfLink = {
    in: ["body", "query"],
    isURL: {
        errorMessage: "Must be a URL"
    },
    optional: true
};

songSchemaValidator.externalSonglink = {
    in: ["body", "query"],
    isURL: {
        errorMessage: "Must be a URL"
    },
    optional: true
};

// @ts-ignore
songSchemaValidator.visualizations = {
    in: ["body", "query"],
    isArray: {
        errorMessage: "must be an array"
    },
    custom: {
        options: [(visualizations: { visualizationType: string, visualization: string }[]) => {
            if (!visualizations.length) {
                throw new Error("At least one visualization id must be provided");
            }
            visualizations.forEach(({ visualizationType, visualization }) => {
                if (typeof visualization !== "string" || typeof visualizationType !== "string") {
                    throw new Error("visualizationType and visualization must be strings");
                }
            });
            return true;
        }]
    },
    customSanitizer: {
        // TODO: Update this somehow and then remove the @ts-ignore in front of songSchemaValidator.visualizations
        // Due to a bug (?) the customSanitizer won't get called for arrays. See https://github.com/express-validator/express-validator/issues/618
        options: [(visualizations: { visualizationType: string, visualization: string }[]) => {
            return visualizations.map(({ visualizationType, visualization }) => { return { visualizationType, visualization: mongoose.Types.ObjectId(visualization) }; });
        }]
    }
};

export { songSchemaValidator };


const Song = mongoose.model("Song", songSchema);
export default Song;
