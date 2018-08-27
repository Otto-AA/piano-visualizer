import { VisualizationStandardFactory, VisualizationFactory, SongFactory, UserFactory } from "./Factory";
import mongoose from "mongoose";

describe("Factory", function () {

    const factories = {
        VisualizationStandard: VisualizationStandardFactory,
        Visualization: VisualizationFactory,
        Song: SongFactory,
        User: UserFactory
    };

    Object.keys(factories)
        .forEach(name => {
            const factory = factories[name];
            const model = mongoose.model(name);

            describe(name, () => {
                it("getValidSamples", async () => {
                    const samples = await factory.getValidSamples(5);

                    const promises = samples.map(sample => {
                        return model.create(sample)
                            .catch(e => {
                                console.error("Error while model.create");
                                console.error("error", e);
                                console.error("sample", sample);
                                throw e;
                            });
                    });
                    return Promise.all(promises);
                });
                it("getInvalidSamples", async () => {
                    const invalidSamples = await factory.getInvalidSamples(5);

                    const promises = invalidSamples.map(async sample => {
                        const doc = new model(sample);
                        try {
                            await doc.validate();
                            throw new Error(`No error while validating an invalid sample: ${JSON.stringify(sample, undefined, 2)}`);
                        }
                        catch (e) {
                            return true;
                        }
                    });
                });
                it("getDoc", () => {
                    return factory.getDoc();
                });
                it("getDocs", () => {
                    return factory.getDocs(5);
                });
            });
        });
});