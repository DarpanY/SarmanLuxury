const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* Ensure the uploads folder exists */
const uploadDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

/* LOCAL DISK STORAGE (Hostinger's own storage — no Cloudinary) */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  }

})

/* Allow images AND videos (product photos + product videos) */
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported file type. Allowed: jpg, png, webp, gif, mp4, webm, mov"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB (covers product videos)
  }
})

module.exports = upload
