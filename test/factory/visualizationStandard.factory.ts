import { SampleFactory } from "./SampleFactory";
import { VisualizationStandardData } from "../../src/models/visualizations/standard";

const visualizationStandardSchema = {
    id: "visualizationStandard",
    type: "object",
    properties: {
        background: {
            $ref: "#/definitions/background"
        },
        audioVisualization: {
            $ref: "#/definitions/audioVisualization"
        },
        pianoVisualization: {
            $ref: "#/definitions/pianoVisualization"
        },
        fontColor: {
            type: "string",
            faker: "internet.color"
        }
    },
    required: ["background", "audioVisualization", "pianoVisualization", "fontColor"],
    definitions: {
        background: {
            type: "object",
            properties: {
                image: {
                    type: "object",
                    properties: {
                        link: {
                            type: "string",
                            faker: "image.imageUrl"
                        },
                        creator: {
                            type: "string",
                            faker: "internet.userName"
                        },
                        creatorLink: {
                            type: "string",
                            faker: "internet.url"
                        }
                    },
                    required: ["link", "creator", "creatorLink"]
                },
                gradient: {
                    $ref: "#/definitions/threeColorGradient"
                },
            },
            required: ["image", "gradient"]
        },
        audioVisualization: {
            type: "object",
            properties: {
                bar: {
                    type: "object",
                    properties: {
                        gradient: {
                            $ref: "#/definitions/threeColorGradient"
                        },
                        width: {
                            type: "integer",
                            minimum: 1
                        },
                    },
                    required: ["gradient", "width"]
                },
            },
            required: ["bar"]
        },
        pianoVisualization: {
            type: "object",
            properties: {
                key: {
                    type: "object",
                    properties: {
                        border: {
                            type: "object",
                            properties: {
                                white: {
                                    type: "boolean"
                                },
                                black: {
                                    type: "boolean"
                                },
                                color: {
                                    type: "string",
                                    faker: "internet.color"
                                }
                            },
                            required: ["white", "black", "color"]
                        },
                        pressedColor: {
                            type: "string",
                            faker: "internet.color"
                        },
                    },
                    required: ["border", "pressedColor"]
                }
            },
            required: ["key"]
        },
        threeColorGradient: {
            type: "array",
            items: Array.from({ length: 3 }).map(() => {
                return {
                    type: "string",
                    faker: "internet.color"
                };
            })
        }

    }
};

export const visualizationStandardFactory = new SampleFactory<VisualizationStandardData>(visualizationStandardSchema);


/** TODO
 * My preferred method would be to use multiple separated schemas instead of one with lots of definitions.
 * Despite the README.md of jsf stating that it should work, I didn't manage to get it working
 * Github issue: https://github.com/json-schema-faker/json-schema-faker/issues/453
 *
 * Note: some required: [...] fields are misplaced in the code below. Before using it you must fix it (required: [...] should be on the same level as properties: {...})
 */
/*
const backgroundSchema = {
    id: "background",
    type: "object",
    properties: {
        image: {
            type: "object",
            properties: {
                link: {
                    type: "string",
                    faker: "image.imageUrl"
                },
                creator: {
                    type: "string",
                    faker: "internet.userName"
                },
                creatorLink: {
                    type: "string",
                    faker: "internet.url"
                }
            },
            required: ["link", "creator", "creatorLink"]
        },
        gradient: {
            $ref: "threeColorGradient"
        },
        required: ["image", "gradient"]
    }
};

const audioVisualizationSchema = {
    id: "audioVisualization",
    type: "object",
    properties: {
        bar: {
            type: "object",
            properties: {
                gradient: {
                    $ref: "threeColorGradient"
                },
                width: {
                    type: "integer",
                    minimum: 1
                },
                required: ["gradient", "width"]
            }
        },
        required: ["bar"]
    }
};

const pianoVisualizationSchema = {
    id: "pianoVisualization",
    type: "object",
    properties: {
        key: {
            type: "object",
            properties: {
                border: {
                    type: "object",
                    properties: {
                        white: {
                            type: "boolean"
                        },
                        black: {
                            type: "boolean"
                        },
                        color: {
                            type: "string",
                            faker: "internet.color"
                        }
                    },
                    required: ["white", "black", "color"]
                }
            },
            pressedColor: {
                type: "string",
                faker: "internet.color"
            },
            required: ["border", "pressedColor"]
        }
    },
    required: ["key"]
};

const threeColorGradientSchema = {
    id: "threeColorGradient",
    type: "array",
    items: Array.from({ length: 3 }).map(() => { return {
        type: "string",
        faker: "internet.color"
    }; })
};
*/