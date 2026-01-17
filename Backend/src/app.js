import express from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/error.middleware.js';
import { setupRoutes } from './config/routes.js';

const app = express();

// --- Middlewares ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.urlencoded({ extended: true })); // Đọc được form data
app.use(express.json()); // Đọc được JSON body

// --- Setup Routes ---
setupRoutes(app);

// --- Global Error Handler ---
app.use(globalErrorHandler);

export default app;