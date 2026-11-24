
import multer from "multer";

// Store uploaded files temporarily in memory.
// We will send them directly to Cloudinary.
const storage = multer.memoryStorage();

// Accept only supported image formats.
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error("Only JPEG, PNG, and WebP images are allowed.")
  );
};

const uploadStudentId = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
    files: 1,
  },
});

export default uploadStudentId;
