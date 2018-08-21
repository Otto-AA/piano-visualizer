import faker from "faker";
import jsf from "json-schema-faker";
import { JsfAsyncFormats } from "./JsfAsyncFormats";
import { visualizationStandardFactory } from "./visualizationStandard.factory";

jsf.extend("faker", function () {
    return faker;
});

const asyncFormats = new JsfAsyncFormats();
jsf.format("visualizationStandardId", () => idFromDoc(asyncFormats.registerAsSync(visualizationStandardFactory.getValidSample)));

export class SchemaDataFactory<T> {
    private schema: { [k: string]: any };

    constructor(schema) {
        this.schema = schema;
    }

    public getValidSample(): Promise<T> {
        return jsf.resolve(this.schema);
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

function idFromDoc(doc) {
    return doc._id;
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
