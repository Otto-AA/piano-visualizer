import { VisualizationStandardFactory } from "../factory/Factory";
import VisualizationStandard from "../../src/models/visualizations/standard";

describe("VisualizationStandard", () => {
    it("should validate visualizations without errors", () => {
        return VisualizationStandardFactory.getValidSamples(5)
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
        // TODO: Update this to use factory.getInvalidSamples as soon as this is implemented
        return VisualizationStandardFactory.getValidSamples(5)
            .then(samples => {
                return Promise.all(samples.map(sample => {
                    delete sample.background; // TODO: Remove me when getInvalidSamples is implemented
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