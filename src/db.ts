import mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";
import bluebird from "bluebird";

const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;

export const CONNECTION_STATES = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    CONNECTING: 2,
    DISCONNECTING: 3
};

export function connect() {
    return mongoose.connect(mongoUrl, { useMongoClient: true });
}

export function disconnect() {
    return mongoose.disconnect();
}

export async function drop() {
    if (mongoose.connection.readyState !== CONNECTION_STATES.CONNECTED) {
        await connect();
    }
    return mongoose.connection.db.dropDatabase();
}