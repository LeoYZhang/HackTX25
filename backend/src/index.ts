import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// CORS configuration - allow all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Set to true if you need to send cookies
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to HackTX25 Backend API',
    status: 'Server is running successfully!',
    endpoints: {
      health: '/health',
      users: {
        create: 'POST /api/users',
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        getByUsername: 'GET /api/users/username/:username',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        login: 'POST /api/users/login'
      }
    }
  });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB connection
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Start the application
startServer();
