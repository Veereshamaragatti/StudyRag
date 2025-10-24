import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory (parent of backend)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  sessionSecret: string;
  geminiApiKey: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  uploadPath: string;
  frontendUrl: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
