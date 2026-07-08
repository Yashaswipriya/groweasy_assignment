import multer from "multer";
import { MAX_UPLOAD_SIZE_BYTES } from "../config/constants";

// Files are kept in memory only - nothing touches disk, matching the
// assignment's "keep the project stateless" option.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      cb(new Error("Only .csv files are accepted."));
      return;
    }
    cb(null, true);
  },
});
