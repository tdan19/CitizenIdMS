import { body } from "express-validator";

export const validateCitizen = [
  body("citizen_id").notEmpty().trim().escape(),
  body("firstName").notEmpty().trim().escape(),
  body("lastName").notEmpty().trim().escape(),
  body("gender").notEmpty().trim().escape(),
  body("dobGregorian").notEmpty().isISO8601(),
  body("phone").notEmpty().trim().escape(),
];
