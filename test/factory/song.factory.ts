import { SongData } from "../../src/models/Song";
import { SchemaDataFactory } from "./SchemaDataFactory";

const songSchema = {
    id: "song",
    type: "object",
    properties: {
        name: {
            type: "string",
            faker: "random.word"
        },
        type: {
            type: "string",
            enum: ["composition", "improvisation", "cover"]
        },
        mp3Link: {
            type: "string",
            faker: "internet.url"
        },
        midLink: {
            type: "string",
            faker: "internet.url"
        },
        pdfLink: {
            type: "string",
            faker: "internet.url"
        },
        externalSongLink: {
            type: "string",
            faker: "internet.url"
        },
        visualizations: {
            type: "array",
            items: [{
                type: "object",
                properties: {
                    visualizationType: "standard",
                    visualization: "visualizationStandardId"
                },
                required: ["visualizationType", "visualization"]
            }]
        }
    },
    required: ["name", "type", "mp3Link", "midLink", "visualizations"]
};
            
export const songFactory = new SchemaDataFactory<SongData>(songSchema);

/*
export const songData = {
    name: "mysongname22",
    type: "composition",
    mp3Link: "https://example.org/mp3",
    midLink: "https://example.org/mid",
    visualizations: [{
        visualizationType: "standard",
        visualization: "5b741d288b95041d9c171aab"
    }, {
        visualizationType: "standard",
        visualization: "5b741d288b95041d9c171aaa"
    }]
};
*/
