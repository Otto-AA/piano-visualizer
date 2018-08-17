import { ValidationSchema } from "express-validator";
import { checkSchema } from "express-validator/check";

const validationSchema: ValidationSchema = {};
checkSchema(validationSchema);