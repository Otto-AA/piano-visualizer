export class JsfAsyncExtensionGroup {
    private extensions: {[name: string]: JsfAsyncExtension} = {};

    public addExtension(name: string, extension: JsfAsyncExtension) {
        this.extensions[name] = extension;
    }

    public getPlaceholderExtension(): {[k: string]: any} {
        const placeholderExtensionGroup = {};
        Object.keys(this.extensions)
            .forEach(name => {
                const extension = this.extensions[name];
                const placeholderExtension = extension.getPlaceholderExtension();
                placeholderExtensionGroup[name] = placeholderExtension;
            });
        return placeholderExtensionGroup;
    }

    public resetInstances(): void {
        Object.keys(this.extensions)
            .forEach(name => this.extensions[name].resetInstances());
    }

    static async resolvePlaceholders(schema): Promise<{[k: string]: any}> {
        const promises = [];

        traverse(schema, (obj, key, val, propPath) => {
            if (Placeholder.isPlaceholder(val)) {
                const promise = Placeholder.resolve(val)
                    .then(resolvedVal => obj[key] = resolvedVal);
                promises.push(promise);
            }
        });
        await Promise.all(promises);
        return schema;
    }
}

export class JsfAsyncExtension {
    private generator: (...args) => any;
    private structure: { [k: string]: any };
    private instances: { [k: string]: any } = {};

    constructor(generator, structure) {
        this.generator = generator;
        this.structure = structure;
    }

    public resetInstances(): void {
        this.instances = {};
    }

    public getPlaceholderExtension() {
        return this.addPlaceholderCreators(this.structure);
    }

    private addPlaceholderCreators({ ...obj }): {[k: string]: any} {
        traverse(obj, (containerObj, key, val, propPath) => {
            containerObj[key] = (options) => {
                const placeholder = new Placeholder(() => this.resolveByPropPath(propPath, options));
                return placeholder.getPlaceholder();
            };
        });
        return obj;
    }

    async resolveByPropPath(propPath, { instanceId = this.getUnusedInstanceId() } = {}) {
        const instance = await this.getResultInstance(instanceId);
        try {
            const val = getPropertyByPath(instance, propPath);
            return val;
        }
        catch (e) {
            console.error(`Couldn't get property for the path ${propPath} from ${instance}`);
            throw e;
        }
    }

    async getResultInstance(instanceId): Promise<{[k: string]: any}> {
        if (!this.instances.hasOwnProperty(instanceId)) {
            await this.addNewInstance(instanceId);
        }

        return this.instances[instanceId];
    }

    async addNewInstance(instanceId) {
        // TODO: Consider getting the data, then checking if it exists and save it. Else multiple could be generated at the same time
        this.instances[instanceId] = await this.getGeneratedData();
    }

    getGeneratedData() {
        return promisify(this.generator);
    }

    private getUnusedInstanceId() {
        const prefix = "__";
        let counter = 0;
        while (this.instances.hasOwnProperty(prefix + counter))
            counter++;
        return prefix + counter;
    }
}

class Placeholder {
    private id: string;
    static _idsCounter: number = 0;
    static _placeholders: { [k: string]: any } = {};

    constructor(callback) {
        this.id = Placeholder.newId();
        Placeholder._storePlaceholder(this.id, {
            id: this.id,
            callback
        });
    }

    getPlaceholder() {
        return this.id;
    }


    static isPlaceholder(placeholder) {
        if (typeof placeholder !== "string")
            return false;

        return Placeholder._idExists(placeholder);
    }

    static resolve(placeholderId) {
        const placeholder = Placeholder._getPlaceholder(placeholderId);
        return placeholder.callback();
    }

    static newId() {
        Placeholder._idsCounter++;
        // Placeholder._idsCounter = (Placeholder._idsCounter !== undefined) ? Placeholder._idsCounter + 1 : 0;
        const newId = Placeholder.getPrefix() + String(Placeholder._idsCounter);
        Placeholder._storeId(newId);
        return newId;
    }

    static _storeId(id) {
        Placeholder._placeholders[id] = undefined;
    }

    static _idExists(id) {
        return Placeholder._placeholders.hasOwnProperty(id);
    }

    static _storePlaceholder(id, placeholder) {
        Placeholder._placeholders[id] = placeholder;
    }

    static _getPlaceholder(id) {
        return Placeholder._placeholders[id];
    }

    static getPrefix() {
        return "__PLACEHOLDER__";
    }
}

function promisify(func): Promise<any> {
    if (func.length === 0) {
        return Promise.resolve(func());
    }
    else if (func.length === 1) {
        return new Promise((resolve, reject) => {
            const callback = (err, val) => err ? reject(err) : resolve(val);
            func(callback);
        });
    }
    else {
        throw new Error("Tried to promisify a function which had more than one argument");
    }
}

function traverse(obj, cb, path = ""): void {
    const keys = Object.keys(obj);
    keys.forEach(key => {
        const innerPath = (path ? (path + ".") : "") + key;
        const val = obj[key];

        if (typeof val === "object") {
            return traverse(val, cb, innerPath);
        }
        else {
            cb(obj, key, val, innerPath);
        }
    });
}

function getPropertyByPath({ ...obj }, path) {
    const props = path.split(".");
    props.forEach(prop => obj = obj[prop]);
    return obj;
}

export function getStructureFromMongooseSchema(schema) {
    const structure: {[k: string]: any} = {};
    schema.eachPath(path => setPropertyByPath(structure, path, true));
    return structure;
}

function setPropertyByPath(obj, path, val) {
    const props = path.split(".");
    const prop = props.shift();
    if (props.length) {
        obj[prop] = obj[prop] || {};
        return setPropertyByPath(obj[prop], props.join("."), val);
    }
    obj[prop] = val;
}