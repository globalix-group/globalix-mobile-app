import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/media');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images, videos, and audio
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  const allowedAudioTypes = [
    'audio/mpeg',
    'audio/mp4',
    'audio/m4a',
    'audio/aac',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/x-m4a',
    'audio/3gpp',
  ];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype) ||
    allowedAudioTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only images (JPEG, PNG, GIF, WebP), videos (MP4, MPEG, MOV, AVI), and audio (MP3, M4A, AAC, WAV, OGG, WebM) are allowed.'
      )
    );
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1,
    fields: 10,
    fieldSize: 1024 * 1024, // 1MB per field
  },
});
