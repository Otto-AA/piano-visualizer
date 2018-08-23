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

    static async resolvePlaceholders(schema): {[k: string]: any} {
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
            containerObj[key] = (options, ...args) => {
                const placeholder = new Placeholder(() => this.resolveByPropPath(propPath, options, ...args));
                return placeholder.getPlaceholder();
            };
        });
        return obj;
    }

    async resolveByPropPath(propPath, { instanceId = 0 } = {}) {
        const instance = await this.getResultInstance(instanceId);
        const val = getPropertyByPath(instance, propPath);
        return val;
    }

    async getResultInstance(instanceId): {[k: string]: any} {
        if (!this.instances.hasOwnProperty(instanceId)) {
            await this.addNewInstance(instanceId);
        }

        return this.instances[instanceId];
    }

    async addNewInstance(instanceId) {
        this.instances[instanceId] = await promisify(this.generator);
    }
}

class Placeholder {
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
        if (typeof placeholder !== 'string')
            return false;
        
        return Placeholder._idExists(placeholder);
    }

    static resolve(placeholderId) {
        const placeholder = Placeholder._getPlaceholder(placeholderId);
        return placeholder.callback();
    }

    static newId() {
        Placeholder._idsCounter = (Placeholder._idsCounter !== undefined) ? Placeholder._idsCounter + 1 : 0;
        const newId = Placeholder.getPrefix() + String(Placeholder._idsCounter);
        Placeholder._storeId(newId);
        return newId;
    }

    static _storeId(id) {
        Placeholder._placeholders = Placeholder._placeholders || {};
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
        return '__PLACEHOLDER__';
    }
}

function promisify(func) {
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
        throw new Error('Tried to promisify a function which had more than one argument');
    }
}

function traverse(obj, cb, path = "") {
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
    })
}

function getPropertyByPath({ ...obj }, path) {
    const props = path.split('.');
    props.forEach(prop => obj = obj[prop]);
    return obj;
}
