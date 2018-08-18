import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

process.env.NODE_ENV = "test";

beforeEach(() => {
    const connection = mongoose.connection;
    const collections = connection.collections;

    Object.keys(collections)
        .map(key => collections[key])
        .forEach(collection => collection.remove({}));
});