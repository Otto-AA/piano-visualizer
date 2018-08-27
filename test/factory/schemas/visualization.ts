export const visualizationSchema = {
    type: "object",
    properties: {
        visualizationType: {
            type: "string",
            enum: ["VisualizationStandard"]
        },
        // TODO: Update this
        usedBySongs: {
            type: "array",
            maxItems: 0,
            items: []
        },
        data: {
            Factory: "VisualizationStandard._id"
        }
    },
    required: ["visualizationType", "usedBySongs", "data"]
};