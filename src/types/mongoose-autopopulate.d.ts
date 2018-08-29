/// <reference types="mongoose" />
import * as mongoose from "mongoose";

declare module "mongoose-autopopulate" {
    export default function (schema: mongoose.Schema): void
}