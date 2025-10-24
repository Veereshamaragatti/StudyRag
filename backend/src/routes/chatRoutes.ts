import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { isAuthenticated, attachUser } from '../middlewares/authMiddleware';
import {
  askQuestion,
  getChatHistory,
  getChat,
  deleteChat,
} from '../controllers/chatController';

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// All routes require authentication
router.use(isAuthenticated, attachUser);

// Ask a question (text or with image)
router.post('/ask', upload.single('image'), askQuestion);

// Get chat history
router.get('/history', getChatHistory);

// Get specific chat
router.get('/:id', getChat);

// Delete chat
router.delete('/:id', deleteChat);

export default router;
