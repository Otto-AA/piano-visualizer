process.env["TEST_SUITE"] = "visualizationStandard";

import { visualizationStandardFactory as factory } from "../factory/visualizationStandard.factory";
import VisualizationStandard from "../../src/models/visualizations/standard";

describe("VisualizationStandard", () => {
    it("should validate visualizations without errors", () => {
        return factory.getValidSamples(50)
            .then(samples => {
                return Promise.all(samples.map(sample => {
                    const visualization = new VisualizationStandard(sample);
                    return new Promise((resolve, reject) => {
                        visualization.validate((err) => {
                            if (err) {
                                console.error("Error while validating sample");
                                console.error("Sample", JSON.stringify(sample));
                                console.error(err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                }));
            });
    });
    it("should throw errors while validating invalid visualizations", () => {
        return factory.getInvalidSamples(50)
            .then(samples => {
                return Promise.all(samples.map(sample => {
                    const visualization = new VisualizationStandard(sample);
                    return new Promise((resolve, reject) => {
                        visualization.validate((err) => {
                            if (err) {
                                return resolve();
                            }

                            reject(new Error(JSON.stringify(sample)));
                        });
                    });
                }));
            });
    });
});