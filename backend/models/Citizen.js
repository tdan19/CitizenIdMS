import mongoose from "mongoose";

const { Schema, model } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    changed_by: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Main schema for citizens
const citizenSchema = new Schema(
  {
    citizen_id: { type: String, unique: true, required: true },

    // Names
    firstName: String,
    firstName_am: String,
    middleName: String,
    middleName_am: String,
    lastName: String,
    lastName_am: String,

    // Dates
    dobGregorian: String,
    given_date: String,
    expire_date: String,

    // Nationality & Gender
    nationality: String,
    nationality_am: String,
    gender: String,
    gender_am: String,

    // Contact
    phone: String,

    // Location
    region: String,
    region_am: String,
    zone: String,
    zone_am: String,
    woreda: String,
    woreda_am: String,
    kebele: String,
    biometrics: {
      photo: String,
      fingerprint: String,
      signature: String,
    },
    // Status tracking
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "waiting"],
      default: "waiting",
    },
    printStatus: {
      type: String,
      enum: ["unprinted", "printed", "delivered", "failed"],
      default: "unprinted",
    },
    status_history: [statusHistorySchema],
  },
  { timestamps: true }
);

// Pre-save hook to ensure status history is properly formatted
citizenSchema.pre("save", function (next) {
  this.status_history = this.status_history.map((item) => ({
    status: item.status,
    changed_by: item.changed_by || "system",
    timestamp: item.timestamp || new Date(),
  }));
  next();
});

export default model("Citizen", citizenSchema);
