import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import { isAuthenticated, attachUser } from '../middlewares/authMiddleware';
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  getDocument,
} from '../controllers/documentController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// All routes require authentication
router.use(isAuthenticated, attachUser);

// Upload document
router.post('/upload', upload.single('file'), uploadDocument);

// List all documents
router.get('/list', listDocuments);

// Get specific document
router.get('/:id', getDocument);

// Delete document
router.delete('/:id', deleteDocument);

export default router;
