import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import globalErrorHandler from './middlewares/error.middleware.js';
import { setupRoutes } from './config/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middlewares ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.urlencoded({ extended: true })); // Đọc được form data
app.use(express.json()); // Đọc được JSON body

// Phục vụ file tĩnh (ảnh upload)
// Đường dẫn: http://localhost:8080/uploads/ten_file.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Setup Routes ---
setupRoutes(app);

// --- Global Error Handler ---
app.use(globalErrorHandler);

export default app;