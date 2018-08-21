import { SchemaDataFactory } from "./SchemaDataFactory";
import mongoose, { Mongoose } from "mongoose";
import Song, { SongModel } from "../../src/models/Song";

export class ModelFactory<modelType, modelData> extends SchemaDataFactory<modelData> {
    private model: mongoose.Model<any>;

    constructor(schema, modelName: string) {
        super(schema);
        const model: mongoose.Model<any> = Song;
        this.model = mongoose.model(modelName);
    }

    public async getSavedDocument(): modelType {
        const sampleData = await this.getValidSample();
        const savedDocument = await this.model.create(sampleData);

        return savedDocument;
    }
}