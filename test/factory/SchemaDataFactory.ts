import faker from "faker";
import jsf from "json-schema-faker";
import { JsfAsyncFormats } from "./JsfAsyncFormats";
import mongoose from "mongoose";

jsf.extend("faker", function () {
    return faker;
});

const asyncFormats = new JsfAsyncFormats();
const formatsHaveLoaded = false;
const loadAsyncFormats = async () => {
    // TODO: Make this function not await, but all run simultaneously
    console.log('Loading dependencies');
    const { visualizationStandardFactory } = await import('./visualizationStandard.factory');
    
    jsf.format("visualizationStandardId", idFormatFromFactory(visualizationStandardFactory));
    formatsHaveLoaded = true;
};

const waitForDependencies = (): Promise<any> => {
    if (formatsHaveLoaded)
        return Promise.resolve();
    return new Promise((resolve, reject) => {
        let interval = undefined;
        interval = setInterval(() => {
            if (formatsHaveLoaded) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
};
waitforDependencies().then(() => console.log('Loaded dependencies'));

export class SchemaDataFactory<T> {
    private schema: { [k: string]: any };

    constructor(schema) {
        this.schema = schema;
    }

    public getValidSample(): Promise<T> {
        return waitForDependencies()
            .then(() => jsf.resolve(this.schema));
    }

    public getValidSamples(n): Promise<T[]> {
        return SchemaDataFactory.getMultiple(n, this.getValidSample.bind(this));
    }

    public getInvalidSample(): Promise<T> {
        return this.getValidSample().then(makeSampleInvalid);
    }

    public getInvalidSamples(n): Promise<T[]> {
        return SchemaDataFactory.getMultiple(n, this.getInvalidSample.bind(this));
    }

    private static getMultiple(n, sampleGenerator: () => Promise<any>): Promise<any[]> {
        const promises = Array.from({ length: n }).map(() => sampleGenerator());
        return Promise.all(promises);
    }
}

function idFormatFromFactory(factory, name) {
    const model = mongoose.model(name);
    
    const getIdFromNewDoc = async () => {
        const data = await factory.getValidSample();
        const savedDoc = await model.create(data);
        return savedDoc._id;
    };
    return asyncFormats.registerAsSync(getIdFromNewDoc);
}


export function makeSampleInvalid(sample) {
    const numValues = getNestedKeys(sample).length;
    const targetIndex = Math.floor(Math.random() * numValues);

    forEachPropInNestedObj(sample, (obj, key, index) => (index === targetIndex) ? obj[key] = changeValueType(obj[key]) : {});

    return sample;
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

function forEachPropInNestedObj(obj, callback, indexObj = { index: 0 }) {
    const keys = Object.keys(obj);

    keys.forEach(key => {
        callback(obj, key, indexObj.index);
        indexObj.index++;

        if (typeof obj[key] === "object") {
            return forEachPropInNestedObj(obj[key], callback, indexObj);
        }
    });
}
