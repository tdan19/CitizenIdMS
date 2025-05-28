import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import Citizen from "../models/Citizen.js";
import path from "path";
const router = express.Router();
const upload = multer();

const biometricFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "fingerprint", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

// ----------------------
// Create New Citizen
// ----------------------
router.post(
  "/",
  biometricFields,
  [
    body("citizen_id").notEmpty().withMessage("Citizen ID is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("dobGregorian")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isISO8601()
      .withMessage("Date of birth must be a valid ISO date"),
    body("phone").notEmpty().withMessage("Phone number is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (
        !req.files?.photo ||
        !req.files?.fingerprint ||
        !req.files?.signature
      ) {
        return res
          .status(400)
          .json({ error: "All biometric files are required." });
      }

      const {
        citizen_id,
        nationality,
        nationality_am,
        dobGregorian,
        firstName,
        firstName_am,
        middleName,
        middleName_am,
        lastName,
        lastName_am,
        gender,
        gender_am,
        phone,
        region,
        region_am,
        zone,
        zone_am,
        woreda,
        woreda_am,
        kebele,
        kebele_am,
      } = req.body;

      const newCitizen = new Citizen({
        citizen_id,
        nationality,
        nationality_am,
        dobGregorian,
        firstName,
        firstName_am,
        middleName,
        middleName_am,
        lastName,
        lastName_am,
        gender,
        gender_am,
        phone,
        region,
        region_am,
        zone,
        zone_am,
        woreda,
        woreda_am,
        kebele,
        kebele_am,
        biometrics: {
          photo: req.files.photo?.[0]?.path,
          fingerprint: req.files.fingerprint?.[0]?.path,
          signature: req.files.signature?.[0]?.path,
        },
      });

      await newCitizen.save();
      res.status(201).json(newCitizen);
    } catch (err) {
      console.error("Error saving citizen:", err);
      res.status(500).json({ error: "Error saving citizen to the database" });
    }
  }
);

// ----------------------
// Update Existing Citizen
// ----------------------
router.put("/:id", biometricFields, async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }

    // Update fields from body
    Object.assign(citizen, req.body);

    // Update biometrics if provided
    if (req.files?.photo) {
      citizen.biometrics.photo = req.files.photo[0].buffer;
    }
    if (req.files?.fingerprint) {
      citizen.biometrics.fingerprint = req.files.fingerprint[0].buffer;
    }
    if (req.files?.signature) {
      citizen.biometrics.signature = req.files.signature[0].buffer;
    }

    await citizen.save();
    res.json(citizen);
  } catch (err) {
    console.error("Error updating citizen:", err);
    res.status(500).json({ error: "Error updating citizen" });
  }
});
export const sendCitizensData = (req, res) => {
  const { citizenIds } = req.body;

  if (!citizenIds || citizenIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No citizens provided" });
  }

  // Logic to process the citizen IDs, e.g., updating their status or sending them somewhere
  console.log("Sending the following citizen IDs:", citizenIds);

  // Example response
  return res.json({
    success: true,
    message: `${citizenIds.length} citizen(s) sent to supervisor successfully!`,
  });
};
const biometrics = {
  photo: req.files.photo?.[0]?.path,
  fingerprint: req.files.fingerprint?.[0]?.path,
  signature: req.files.signature?.[0]?.path,
};

// Example: update citizen record with biometric paths
await Citizen.updateOne({ _id: citizenId }, { $set: { biometrics } });

res.json({ message: "Biometrics uploaded", biometrics });

export default router;
