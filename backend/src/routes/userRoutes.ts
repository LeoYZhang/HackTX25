import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/userController';

const router = Router();

// User routes
router.post('/users', createUser);           // Create a new user
router.get('/users', getAllUsers);           // Get all users
router.get('/users/:id', getUserById);       // Get user by ID
router.get('/users/username/:username', getUserByUsername); // Get user by username
router.put('/users/:id', updateUser);        // Update user by ID
router.delete('/users/:id', deleteUser);     // Delete user by ID
router.post('/users/login', loginUser);      // Login user

export default router;
