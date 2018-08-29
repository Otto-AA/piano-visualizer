import mongoose from "mongoose";

export function noCast(type: string) {
    const name = `NoCast_${type}`;
    function noCastElement(key: any, options?: any) {
        mongoose.SchemaType.call(this, key, options, name);
    }
    Object.defineProperty(noCastElement, "name", {value: name, writable: false});

    noCastElement.prototype = Object.create(mongoose.SchemaType.prototype);
    noCastElement.prototype.cast = function (val: any) {
        if (typeof val !== type) {
            throw new Error(`${name}: ${val} is not of type ${type}`);
        }
        return val;
    };
    // @ts-ignore
    mongoose.Schema.Types[name] = noCastElement;
    return noCastElement;
}

export const NoCastString = noCast("string");
export const NoCastNumber = noCast("number");
export const NoCastObject = noCast("object");
export const NoCastBoolean = noCast("boolean");