// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { GridFSBucket } from "mongodb";

// // Configure local file storage
// const uploadDir = "/uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// export const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

// // Optional: GridFS upload function if you want to keep that option
// export const uploadToGridFS = (fileBuffer, filename, dbConnection) => {
//   if (!dbConnection) throw new Error("Database connection not available");

//   const bucket = new GridFSBucket(dbConnection.db, { bucketName: "uploads" });
//   const uploadStream = bucket.openUploadStream(filename);
//   uploadStream.end(fileBuffer);
//   return uploadStream.id;
// };
