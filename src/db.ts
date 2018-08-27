import mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";
import bluebird from "bluebird";

const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true}).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

export function connect() {
    return mongoose.connect(mongoUrl, { useMongoClient: true });
}