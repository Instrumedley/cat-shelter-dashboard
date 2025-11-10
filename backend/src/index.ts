import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { setupSwagger } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { metricsRoutes } from './routes/metrics';
import { statsRoutes } from './routes/stats';
import { catsRoutes } from './routes/cats';
import { adoptionsRoutes } from './routes/adoptions';
import { donationsRoutes } from './routes/donations';

dotenv.config();

const app = express();
const server = createServer(app);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 7000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI compatibility
  crossOriginOpenerPolicy: false, // Allow cross-origin opener policy
  crossOriginResourcePolicy: false, // Allow cross-origin resource policy
}));
// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:3000", // Fallback for other projects
  "http://localhost:3001",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development or if NODE_ENV is not set, allow all localhost origins
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation (must be before routes)
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api', statsRoutes);
app.use('/api/cats', catsRoutes);
app.use('/api/adoptions', adoptionsRoutes);
app.use('/api/donations', donationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for use in other modules
(global as any).io = io;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});

export { io };
