import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Citizen from "../models/Citizen.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer(); // For file upload if still needed

// GET all citizens
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const citizens = await Citizen.find(filter)
      .select("-biometrics.photo -biometrics.fingerprint -biometrics.signature")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: citizens.length,
      data: citizens,
    });
  } catch (error) {
    console.error("Error fetching citizens:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching citizens",
      error: error.message,
    });
  }
});

// GET citizen by ID
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

// POST new citizen
router.post(
  "/",
  upload.none(), // We no longer handle raw file buffers here, so expect URLs in the body
  [
    body("citizen_id").notEmpty(),
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("gender").notEmpty(),
    body("dobGregorian").notEmpty().isISO8601(),
    body("phone").notEmpty(),
    body("biometrics.photo").isURL(),
    body("biometrics.fingerprint").isURL(),
    body("biometrics.signature").isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { biometrics, ...rest } = req.body;

      // Ensure biometrics URLs are present
      if (
        !biometrics ||
        !biometrics.photo ||
        !biometrics.fingerprint ||
        !biometrics.signature
      ) {
        return res.status(400).json({
          success: false,
          error:
            "All biometric URLs (photo, fingerprint, signature) are required.",
        });
      }

      const statusHistory = [
        {
          status: "pending",
          changed_by: "registrar",
          timestamp: new Date(),
        },
      ];

      const newCitizen = new Citizen({
        ...rest,
        status_history: statusHistory,
        biometrics,
      });

      await newCitizen.save();
      res.status(201).json({ success: true, data: newCitizen });
    } catch (error) {
      console.error("Error saving citizen:", error);
      res.status(500).json({
        success: false,
        message: "Error saving citizen",
        error: error.message,
      });
    }
  }
);

// PUT update citizen
router.put(
  "/:id",
  upload.none(), // Expect URLs in req.body.biometrics
  async (req, res) => {
    try {
      const citizen = await Citizen.findById(req.params.id);
      if (!citizen) {
        return res
          .status(404)
          .json({ success: false, error: "Citizen not found" });
      }

      const {
        status,
        changed_by = "registrar",
        biometrics,
        ...rest
      } = req.body;
      const statusChanged = status && status !== citizen.status;

      // Update fields from req.body except biometrics (handle separately)
      Object.assign(citizen, rest);

      // Update biometric URLs if provided
      if (biometrics) {
        if (biometrics.photo) citizen.biometrics.photo = biometrics.photo;
        if (biometrics.fingerprint)
          citizen.biometrics.fingerprint = biometrics.fingerprint;
        if (biometrics.signature)
          citizen.biometrics.signature = biometrics.signature;
      }

      // Push status history if status changed
      if (statusChanged) {
        citizen.status = status;
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

// PATCH: Mark as printed
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

// DELETE citizen
router.delete("/:id", async (req, res) => {
  try {
    const deletedCitizen = await Citizen.findByIdAndDelete(req.params.id);
    if (!deletedCitizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Citizen deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting citizen:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting citizen",
      error: error.message,
    });
  }
});

// POST: Approve citizens
router.post("/approve", verifyToken, async (req, res) => {
  try {
    const { citizenIds } = req.body;
    const supervisorId = req.user._id;

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
              $set: { status: "approved" },
              $push: {
                status_history: {
                  status: "approved",
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

// POST: Reject citizens
router.post("/reject", verifyToken, async (req, res) => {
  try {
    const { citizenIds } = req.body;
    const supervisorId = req.user._id;

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
                rejectionReason: "Rejected by supervisor",
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

// POST: Send citizens for processing
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

// GET: Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalPopulation = await Citizen.countDocuments();

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

    const stats = {
      totalPopulation: totalPopulation || 0,
      lastUpdated: new Date(),
      pending: 0,
      approved: 0,
      rejected: 0,
      printed: 0,
      unprinted: 0,
    };

    statusCounts.forEach(({ _id, count }) => {
      if (_id && stats.hasOwnProperty(_id)) {
        stats[_id] = count;
      }
    });

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

export default router;
