import express from "express";
import multer from "multer";
import mongoose from "mongoose"; // ✅ Needed for ObjectId validation
import { body, validationResult } from "express-validator";
import Citizen from "../models/Citizen.js";
import { verifyToken, restrictTo } from "../middleware/authMiddleware.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure file storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "fingerprint", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { files, body } = req;

      if (!files?.photo || !files?.fingerprint || !files?.signature) {
        return res.status(400).json({
          success: false,
          error: "All biometric files are required.",
        });
      }

      // Extract fields explicitly
      const {
        citizen_id,
        nationality,
        nationality_am,
        dobGregorian,
        given_date,
        expire_date,
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
        status,
        status_history,
      } = body;

      if (!citizen_id) {
        return res.status(400).json({
          success: false,
          error: "citizen_id is required.",
        });
      }

      // Check for duplicate citizen_id
      const existingCitizen = await Citizen.findOne({ citizen_id });
      if (existingCitizen) {
        return res.status(409).json({
          success: false,
          error: `Citizen with ID ${citizen_id} already exists.`,
        });
      }

      // Parse status_history if it's a string
      const parsedStatusHistory =
        typeof status_history === "string"
          ? JSON.parse(status_history)
          : status_history;

      const newCitizen = new Citizen({
        citizen_id,
        nationality,
        nationality_am,
        dobGregorian,
        given_date,
        expire_date,
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
        status,
        status_history: parsedStatusHistory,
        biometrics: {
          photo: `/uploads/${files.photo[0].filename}`,
          fingerprint: `/uploads/${files.fingerprint[0].filename}`,
          signature: `/uploads/${files.signature[0].filename}`,
        },
      });

      await newCitizen.save();

      res.status(201).json({
        success: true,
        data: newCitizen,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error during registration",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const citizens = await Citizen.find(filter)
      .select("-biometrics.photo -biometrics.fingerprint -biometrics.signature")
      .sort({ createdAt: -1 })
      .lean();

    res
      .status(200)
      .json({ success: true, count: citizens.length, data: citizens });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching citizens",
      error: error.message,
    });
  }
});

// Removed duplicate storage and upload declarations to avoid redeclaration errors.
router.patch("/bulk-print-status", verifyToken, async (req, res) => {
  try {
    const { ids, newStatus } = req.body;

    if (!Array.isArray(ids) || !newStatus) {
      console.log("Invalid input:", req.body);
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    // Validate all IDs
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid ObjectId:", id);
        return res
          .status(400)
          .json({ success: false, message: "Invalid citizen ID(s)" });
      }
    }

    const result = await Citizen.updateMany(
      { _id: { $in: ids } },
      { $set: { printStatus: newStatus } }
    );

    return res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Bulk update failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Add this route (make sure it's not nested inside another route)

// ----------------------
// GET all citizens
// ----------------------
// PUT THIS NEAR THE TOP before any :id route!
router.get("/status/:citizenId", async (req, res) => {
  const citizenId = req.params.citizenId.trim();
  console.log("Received request for:", citizenId);

  try {
    // Accept both with and without ET- prefix, ignore case
    const regex = new RegExp(`^(ET-)?${citizenId.replace(/^ET-/, "")}$`, "i");
    const citizen = await Citizen.findOne({ citizen_id: regex });
    if (!citizen) {
      console.log("No citizen found for:", citizenId);
      return res.status(404).json({ message: "No data found for this ID." });
    }

    console.log("Citizen found:", citizen._id);
    res.json({ data: citizen });
  } catch (err) {
    console.error("Error fetching citizen:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, error: "Citizen not found" });
    }
    Object.keys(req.body).forEach((key) => {
      if (key !== "citizen_id" && key !== "status_history") {
        citizen[key] = req.body[key];
      }
    });
    await citizen.save();
    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error("Error updating citizen:", error);
    res.status(500).json({ success: false, error: "Error updating citizen" });
  }
});
// ----------------------
// GET citizen by ID
// ----------------------
router.get("/:id", async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id)
      .select("-biometrics.photo -biometrics.fingerprint -biometrics.signature")
      .lean();

    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, error: "Citizen not found" });
    }

    res.status(200).json({ success: true, data: citizen });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching citizen",
      error: error.message,
    });
  }
});

// PUT update citizen
// ----------------------
router.put(
  "/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "fingerprint", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const citizen = await Citizen.findById(req.params.id);
      if (!citizen) {
        return res
          .status(404)
          .json({ success: false, error: "Citizen not found" });
      }

      const { status, changed_by = "registrar" } = req.body;
      const statusChanged = status && status !== citizen.status;

      Object.assign(citizen, req.body);

      if (req.files?.photo) {
        citizen.biometrics.photo = req.files.photo[0].buffer;
      }
      if (req.files?.fingerprint) {
        citizen.biometrics.fingerprint = req.files.fingerprint[0].buffer;
      }
      if (req.files?.signature) {
        citizen.biometrics.signature = req.files.signature[0].buffer;
      }

      if (statusChanged) {
        citizen.status_history.push({
          status,
          changed_by,
          timestamp: new Date(),
        });
      }

      await citizen.save();
      res.json({ success: true, data: citizen });
    } catch (error) {
      console.error("Error updating citizen:", error);
      res.status(500).json({ success: false, error: "Error updating citizen" });
    }
  }
);

// ----------------------
// POST: Approve citizens
// ----------------------
router.post("/approve", verifyToken, async (req, res) => {
  try {
    const { citizenIds } = req.body;
    const supervisorId = req.user._id; // Get from verified token

    // Validate input
    if (!citizenIds || !Array.isArray(citizenIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid citizen IDs",
      });
    }

    // Process approvals
    const results = await Promise.all(
      citizenIds.map(async (id) => {
        try {
          const citizen = await Citizen.findByIdAndUpdate(
            id,
            {
              $set: { status: "approved" },
              $push: {
                status_history: {
                  status: "approved",
                  changed_by: supervisorId, // Use ID from token
                  timestamp: new Date(),
                },
              },
            },
            { new: true }
          );
          return { id, success: !!citizen };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      })
    );

    const failed = results.filter((r) => !r.success);
    res.json({
      success: failed.length === 0,
      message: failed.length ? `${failed.length} failed` : "All approved",
      results,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during approval",
    });
  }
});

// ----------------------
// POST: Reject citizen
// ----------------------
router.post("/reject", verifyToken, async (req, res) => {
  try {
    const { citizenIds } = req.body;
    const supervisorId = req.user._id; // From token

    if (!citizenIds || !Array.isArray(citizenIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid citizen IDs",
      });
    }

    const results = await Promise.all(
      citizenIds.map(async (id) => {
        try {
          const citizen = await Citizen.findByIdAndUpdate(
            id,
            {
              $set: {
                status: "rejected",
                rejectionReason: "Rejected by supervisor", // Default reason
              },
              $push: {
                status_history: {
                  status: "rejected",
                  changed_by: supervisorId,
                  timestamp: new Date(),
                },
              },
            },
            { new: true }
          );
          return { id, success: !!citizen };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      })
    );

    const failed = results.filter((r) => !r.success);
    res.json({
      success: failed.length === 0,
      message: failed.length ? `${failed.length} failed` : "All rejected",
      results,
    });
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during rejection",
    });
  }
});

// ----------------------
// PATCH: Mark as printed
// ----------------------
router.patch("/:id/print", async (req, res) => {
  try {
    await Citizen.findByIdAndUpdate(req.params.id, {
      printStatus: "printed",
      lastUpdated: new Date(),
    });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update print status",
    });
  }
});

// ----------------------
// DELETE: Citizen by ID
// ----------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Citizen.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Citizen deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete citizen" });
  }
});

// ----------------------
// POST: Send citizens for processing
// ----------------------
router.post("/send", async (req, res) => {
  const { citizenIds } = req.body;
  try {
    await Citizen.updateMany(
      { _id: { $in: citizenIds }, status: "waiting" },
      {
        $set: { status: "pending" },
        $push: {
          status_history: {
            status: "pending",
            changed_by: "registrar",
            timestamp: new Date(),
          },
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to send citizens" });
  }
});

// GET /api/citizens/stats
// GET /api/citizens/stats - Enhanced with better error handling
router.get("/stats", async (req, res) => {
  try {
    // 1. Get total population count
    const totalPopulation = await Citizen.countDocuments();

    // 2. Get status counts with error handling for each aggregation
    const [statusCounts, printCounts] = await Promise.all([
      Citizen.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]).exec(),

      Citizen.aggregate([
        {
          $group: {
            _id: "$printStatus",
            count: { $sum: 1 },
          },
        },
      ]).exec(),
    ]);

    // 3. Transform data with null checks
    const stats = {
      totalPopulation: totalPopulation || 0,
      lastUpdated: new Date(),
      pending: 0,
      approved: 0,
      rejected: 0,
      printed: 0,
      unprinted: 0,
    };

    // Merge status counts
    statusCounts.forEach(({ _id, count }) => {
      if (_id && stats.hasOwnProperty(_id)) {
        stats[_id] = count;
      }
    });

    // Merge print status counts
    printCounts.forEach(({ _id, count }) => {
      if (_id && stats.hasOwnProperty(_id)) {
        stats[_id] = count;
      }
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Stats aggregation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/:id/biometrics", async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id).select("biometrics");

    if (!citizen || !citizen.biometrics) {
      return res.status(404).json({
        success: false,
        message: "Biometrics not found.",
      });
    }

    res.json({
      success: true,
      data: citizen.biometrics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Add this route to your backend
// Express route (Node.js backend)

// In your backend routes file (e.g., routes/citizen.js)
router.get("/registration", async (req, res) => {
  try {
    const citizens = await Citizen.find({
      status: req.query.status || "approved",
    }).select(
      "-biometrics.photo -biometrics.fingerprint -biometrics.signature"
    );
    res.json({ success: true, data: citizens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/registration/:id/biometrics", async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id).select("biometrics");
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }
    res.json({ success: true, data: citizen.biometrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/registration/:id/print", async (req, res) => {
  try {
    const citizen = await Citizen.findByIdAndUpdate(
      req.params.id,
      { printStatus: req.body.printStatus },
      { new: true }
    );
    res.json({ success: true, data: citizen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
