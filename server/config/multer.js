import multer from "multer";

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.floor(100000 + Math.random() * 900000) + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// File filter only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

//pre-configured fields middleware
export const uploadHomeImages = upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]);

export default upload;