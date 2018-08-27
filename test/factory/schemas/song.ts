export const songSchema = {
    id: "song",
    type: "object",
    properties: {
        name: {
            type: "string",
            faker: "random.word"
        },
        userId: {
            Factory: "User._id"
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
                    visualizationType: {
                        type: "string",
                        enum: ["standard"]
                    },
                    visualization: {
                        Factory: "Visualization._id"
                    }
                },
                required: ["visualizationType", "visualization"]
            }]
        }
    },
    required: ["name", "userId", "type", "mp3Link", "midLink", "visualizations"]
};