import mongoose, { mongo } from "mongoose";
import * as db from "../src/db";
import dotenv from "dotenv";
dotenv.config();

process.env.NODE_ENV = "test";
jest.setTimeout(10 * 1000);

beforeEach(() => {
    if (mongoose.connection.readyState === db.CONNECTION_STATES.DISCONNECTED) {
        console.log("Manually connecting to database as no connections were found");
        return db.connect();
    }
});

beforeEach(() => {
    const connection = mongoose.connection;
    const collections = connection.collections;

    Object.keys(collections)
        .map(key => collections[key])
        .forEach(collection => collection.remove({}));
});

afterAll(() => {
    // NOTE: This apparently doesn't remove all databases despite throwing no error
    return db.drop();
});