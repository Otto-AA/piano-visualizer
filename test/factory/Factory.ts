import jsf from "json-schema-faker";
import { JsfAsyncExtension, JsfAsyncExtensionGroup, getStructureFromMongooseSchema } from "./JsfAsyncExtension";
import faker from "faker";

import mongoose from "mongoose";

import { visualizationStandardSchema } from "./schemas/visualizationStandard";
import { songSchema } from "./schemas/song";
import VisualizationStandard, { VisualizationStandardData, VisualizationStandardDoc } from "../../src/models/visualizations/standard";
import Song, { SongData, SongDoc } from "../../src/models/Song";
import Visualization, { VisualizationData, VisualizationDoc } from "../../src/models/Visualization";
import { visualizationSchema } from "./schemas/visualization";
import User, { UserData, UserDoc } from "../../src/models/User";
import { userSchema } from "./schemas/user";

// Make sure typescript loads the modules
VisualizationStandard;
Visualization;
Song;
User;


class Factory<SampleData extends { [k: string]: any }, SampleDoc extends mongoose.Document> {
    public modelName: string;
    private model: mongoose.Model<SampleDoc>;
    private schema: { [k: string]: any };
    private references: { [k: string]: any }[];

    constructor(modelName, schema, references = []) {
        this.schema = schema;
        this.references = references;
        this.modelName = modelName;
        this.model = mongoose.model(modelName);
    }

    public async getSample(): Promise<SampleData> {
        const sample = await jsf.resolve(this.schema, this.references)
            .then(JsfAsyncExtensionGroup.resolvePlaceholders);
        return sample;
    }

    public getInvalidSample(): Promise<any> {
        return this.getSample().then(sample => changeMultipleProperties(sample, 1));
    }

    public getValidSamples(n): Promise<SampleData[]> {
        return Factory.getMultiple(n, () => this.getSample());
    }

    public getInvalidSamples(n): Promise<any[]> {
        return Factory.getMultiple(n, () => this.getInvalidSample());
    }

    public async getDoc(): Promise<SampleDoc> {
        const sampleData = await this.getSample();
        try {
            return await this.model.create(sampleData);
        }
        catch (e) {
            console.error("Error while getDoc", e);
            console.error("sampleData", sampleData);
            throw e;
        }
    }

    public getDocs(n): Promise<SampleDoc[]> {
        // TODO: Check how JsfAsyncExtension stores instances and consider reworking this
        return Factory.getMultiple(n, () => this.getDoc());
    }

    private static getMultiple(n, sampleGenerator: () => Promise<any>): Promise<any[]> {
        const promises = Array.from({ length: n }).map(() => sampleGenerator());
        return Promise.all(promises);
    }
}


export const VisualizationStandardFactory = new Factory<VisualizationStandardData, VisualizationStandardDoc>("VisualizationStandard", visualizationStandardSchema);
export const VisualizationFactory = new Factory<VisualizationData, VisualizationDoc>("Visualization", visualizationSchema);
export const SongFactory = new Factory<SongData, SongDoc>("Song", songSchema);
export const UserFactory = new Factory<UserData, UserDoc>("User", userSchema);
// export const BaseFactory = new Factory<any, mongoose.Document>("Base", schemaBase);
// export const MiddleFactory = new Factory<any, mongoose.Document>("Middle", schemaMiddle);
// export const ParentFactory = new Factory<any, mongoose.Document>("Parent", schemaParent);

jsf.extend("faker", () => faker);
extendJsfWithFactoryModels("Factory", [
    VisualizationStandardFactory,
    VisualizationFactory,
    SongFactory,
    UserFactory
]);


function extendJsfWithFactoryModels(extensionName: string, factories: Factory<any, any>[]): JsfAsyncExtensionGroup {
    const asyncExtensionGroup = new JsfAsyncExtensionGroup();

    factories.forEach(factory => {
        const name = factory.modelName;
        const model = mongoose.model(factory.modelName);
        const structure = getStructureFromMongooseSchema(model.schema);
        const getDocObject = () => factory.getDoc().then(mongooseDocToObject);
        const extension = new JsfAsyncExtension(getDocObject, structure);
        asyncExtensionGroup.addExtension(factory.modelName, extension);
    });

    jsf.extend(extensionName, () => asyncExtensionGroup.getPlaceholderExtension());
    return asyncExtensionGroup;
}

function mongooseDocToObject(doc: mongoose.Document) {
    // Probably not the best solution. Based on: https://github.com/Automattic/mongoose/issues/2790
    return JSON.parse(JSON.stringify(doc.toObject()));
}

function changeMultipleProperties(obj, changeCount) {
    const numberOfProperties = getNestedKeys(obj).length;
    const getProbabilityFromIndex = index => (index * changeCount) / numberOfProperties;
    let index = 0;

    forEachPropInNestedObj(obj, (nestedObj, key, val) => {
        index++;
        if (getProbabilityFromIndex(index) > Math.random()) {
            nestedObj[key] = changeValueType(val);
            changeCount--;
        }
    });

    return obj;
}


function changeValueType(val) {
    return getRandomVal({ excludeTypes: [ typeof val ] });
}

function getRandomVal( { excludeTypes = [] } = {}) {
    const typeGenerators = {
        undefined: () => undefined,
        object: generateRandomObject,
        boolean: faker.random.boolean,
        number: faker.random.number,
        string: faker.random.words
    };
    excludeTypes.forEach(type => type in typeGenerators ? delete typeGenerators[type] : {});
    const randomGenerator = faker.random.objectElement(typeGenerators);
    return randomGenerator();
}

function generateRandomObject() {
    const obj = {};
    const numProperties = Math.floor(Math.random() * 3);

    for (let i = 0; i < numProperties; i++) {
        const key = faker.random.words();
        const val = getRandomVal();
        obj[key] = val;
    }
    return obj;
}

function getNestedKeys (obj) {
    const keysForNonObjects = Object.keys(obj).filter(key => typeof obj[key] !== "object");
    const keysForObjects = Object.keys(obj).filter(key => typeof obj[key] === "object");
    const nestedKeys = [];
    keysForObjects.forEach((key) => nestedKeys.push(...getNestedKeys(obj[key])));

    return [...keysForNonObjects, ...nestedKeys];
}

function forEachPropInNestedObj(obj, callback) {
    const keys = Object.keys(obj);

    keys.forEach(key => {
        callback(obj, key, obj[key]);

        if (typeof obj[key] === "object") {
            return forEachPropInNestedObj(obj[key], callback);
        }
    });
}